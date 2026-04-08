from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import io
import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from backend.models import (
    VoterRegistration, VoterLogin, AdminLogin, 
    ElectionCreate, VoteRequest, VoteVerification, Candidate, INDIAN_STATES
)
from backend.auth import VoterAuth, AdminAuth, MockAadhaarAuth
from backend.db_config import get_database
from backend.encryption import hash_voter_token

app = FastAPI(title="Blockchain Voting System")

# CORS Configuration - Only allow localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = get_database()

# Configure AdminAuth to use database for authentication
AdminAuth.set_database(db)
print("✅ AdminAuth configured to use database authentication")

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


# Middleware to check role-based access
def check_admin_access(request: Request) -> Dict:
    """Verify admin authentication and return session data."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = db.get_session(auth_header.replace("Bearer ", ""))
    if not session or session.get("type") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return session


def check_voter_access(request: Request) -> Dict:
    """Verify voter authentication and return session data."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = db.get_session(auth_header.replace("Bearer ", ""))
    if not session or session.get("type") != "voter":
        raise HTTPException(status_code=403, detail="Voter access required")
    
    return session


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Landing page."""
    return templates.TemplateResponse(request=request, name="index.html", context={})


@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    """Admin dashboard - Only for admins."""
    # Check if there's a session token in query params or cookies
    auth_header = request.headers.get("Authorization", "")
    if auth_header:
        session = db.get_session(auth_header.replace("Bearer ", ""))
        if session and session.get("type") == "voter":
            # Voter trying to access admin panel - redirect to voter page
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url="/voter")
    return templates.TemplateResponse(request=request, name="admin.html", context={})


@app.get("/voter", response_class=HTMLResponse)
async def voter_page(request: Request):
    """Voter interface - Only for voters."""
    # Check if there's a session token in query params or cookies
    auth_header = request.headers.get("Authorization", "")
    if auth_header:
        session = db.get_session(auth_header.replace("Bearer ", ""))
        if session and session.get("type") == "admin":
            # Admin trying to access voter panel - redirect to admin page
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url="/admin")
    return templates.TemplateResponse(request=request, name="voter.html", context={})


@app.get("/verify", response_class=HTMLResponse)
async def verify_page(request: Request):
    """Public vote verification portal."""
    return templates.TemplateResponse(request=request, name="verify.html", context={})


@app.get("/statistics", response_class=HTMLResponse)
async def statistics_page(request: Request):
    """Public statistics dashboard showing voting participation."""
    return templates.TemplateResponse(request=request, name="statistics.html", context={})


@app.get("/candidate", response_class=HTMLResponse)
async def candidate_profile_page(request: Request):
    """Candidate profile page with detailed information."""
    return templates.TemplateResponse(request=request, name="candidate.html", context={})


@app.post("/api/admin/login")
async def admin_login(login: AdminLogin):
    """Admin login endpoint with state-based access."""
    try:
        success, error, admin_data = AdminAuth.authenticate_admin(login.username, login.password)
        
        if not success or not admin_data:
            print(f"❌ Authentication failed for user: {login.username}")
            raise HTTPException(status_code=401, detail=error or "Authentication failed")
        
        session_token = AdminAuth.generate_admin_session_token()
        print(f"✅ Admin authenticated: {login.username} ({admin_data['state']})")
        
        # Save session with correct parameters: (session_token, user_id, session_type, user_data)
        db.save_session(session_token, admin_data["username"], "admin", {
            "username": admin_data["username"],
            "state": admin_data["state"],
            "role": admin_data["role"],
            "created_at": datetime.now().isoformat()
        })
        
        print(f"✅ Session saved for {login.username}")
        
        return {
            "success": True,
            "session_token": session_token,
            "username": admin_data["username"],
            "state": admin_data["state"],
            "role": admin_data["role"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


def send_otp_sms(phone, otp_code, context):
    try:
        import os
        from twilio.rest import Client
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        
        if twilio_sid and twilio_token and twilio_verify_sid:
            client = Client(twilio_sid, twilio_token)
            verification = client.verify.v2.services(twilio_verify_sid).verifications.create(to=phone, channel='sms')
            print(f"✅ Twilio Verify SMS sent successfully to {phone} (Status: {verification.status})")
            return True
        else:
            print("⚠️ Twilio Verify credentials missing from .env. Skipping SMS.")
            return False
    except Exception as twilio_error:
        print(f"❌ Twilio SMS failed: {twilio_error}")
        return False


@app.post("/api/voter/request-otp")
async def request_otp(data: Dict):
    """
    Request OTP for voter login via SMS.
    
    Flow:
    1. Validate Aadhaar number (12 digits)
    2. Look up voter's phone from database
    3. Send OTP via Supabase Auth SMS
    4. Return success with masked phone
    """
    aadhaar_number = data.get("aadhaar_number")
    
    if not aadhaar_number or len(aadhaar_number) != 12:
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number (must be 12 digits)")
    
    # Get voter's phone from database (optional in local fallback mode)
    phone = db.get_phone_by_aadhaar(aadhaar_number)
    voter = db.get_voter_by_aadhaar(aadhaar_number)

    if not voter:
        raise HTTPException(status_code=404, detail="Aadhaar number not registered. Please contact admin.")

    # Ensure phone is in international format (+91xxxxxxxxxx) when available.
    if phone and not phone.startswith("+"):
        phone = "+91" + phone if phone.startswith("91") else "+91" + phone
    
    # Generate and store OTP (6 digits)
    otp_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store OTP in session with expiration (5 minutes)
    otp_session_key = f"otp_{aadhaar_number}"
    
    # Delete any existing OTP session for this Aadhaar
    try:
        db.delete_session(otp_session_key)
    except:
        pass  # Ignore if session doesn't exist
    
    # Save new OTP session (5 min expiry)
    db.save_session(otp_session_key, aadhaar_number, "otp", {
        "otp": otp_code,
        "phone": phone,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(minutes=5)).isoformat()
    })
    
    # ALWAYS show OTP in terminal for easy access
    print(f"\n{'='*60}")
    print(f"🔐 OTP GENERATED FOR AADHAAR: {aadhaar_number[:4]}****{aadhaar_number[-4:]}")
    print(f"📱 Phone: {phone}")
    print(f"🔢 OTP CODE: {otp_code}")
    print(f"⏰ Valid for: 5 minutes")
    print(f"{'='*60}\n")
    
    # Send OTP via Twilio / Textbelt / Terminal
    has_phone = bool(phone)
    sms_sent = False
    
    if has_phone:
        sms_sent = send_otp_sms(phone, otp_code, "Login")
    else:
        print("?? No phone found for voter. Using terminal OTP for local login.")
        print(f"💡 Use the OTP shown above in terminal: {otp_code}")
    
    # Mask phone for privacy (show last 4 digits)
    masked_phone = "***" + phone[-4:] if phone and len(phone) >= 4 else "local-mode"
    
    return {
        "success": True,
        "message": f"OTP sent to {masked_phone} via SMS. Check your messages.",
        "phone_masked": masked_phone,
        "otp_hint": f"OTP starts with {otp_code[:2]}**",
        "expires_in": "5 minutes"
    }


@app.post("/api/voter/verify-otp")
async def verify_otp(data: Dict):
    """
    Verify OTP and log in voter.
    
    Flow:
    1. Receive Aadhaar + OTP
    2. Get voter's email from database
    3. Verify OTP with Supabase Auth
    4. Create session token
    5. Return voter credentials
    """
    aadhaar_number = data.get("aadhaar_number")
    otp_code = data.get("otp")
    
    if not aadhaar_number or len(aadhaar_number) != 12:
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number")
    
    if not otp_code or len(otp_code) != 6:
        raise HTTPException(status_code=400, detail="Invalid OTP (must be 6 digits)")
    
    # Get voter from database
    voter = db.get_voter_by_aadhaar(aadhaar_number)
    
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    email = voter.get("email") or f"{voter['voter_id'].lower()}@local.test"
    
    # Verify OTP from stored session
    otp_session_key = f"otp_{aadhaar_number}"
    otp_session = db.get_session(otp_session_key)
    
    if not otp_session:
        raise HTTPException(status_code=401, detail="OTP expired or not found. Please request a new OTP.")
    
    # Check if OTP is expired (5 minutes)
    expires_at = datetime.fromisoformat(otp_session.get("expires_at", ""))
    if datetime.now() > expires_at:
        # Clean up expired OTP
        db.delete_session(otp_session_key)
        raise HTTPException(status_code=401, detail="OTP expired after 5 minutes. Please request a new OTP.")
    
    # Verify OTP matches
    stored_otp = otp_session.get("otp")
    if stored_otp == otp_code:
        pass # Valid local terminal OTP
    else:
        import os
        from twilio.rest import Client
        twilio_verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        if twilio_verify_sid:
            try:
                client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
                phone_to_verify = otp_session.get("phone")
                verification_check = client.verify.v2.services(twilio_verify_sid).verification_checks.create(to=phone_to_verify, code=otp_code)
                if verification_check.status != "approved":
                    raise HTTPException(status_code=401, detail="Invalid OTP. Please check and try again.")
            except Exception as e:
                if isinstance(e, HTTPException): raise e
                raise HTTPException(status_code=401, detail=f"Invalid OTP or verification failed: {e}")
        else:
            raise HTTPException(status_code=401, detail="Invalid OTP. Please check and try again.")
    
    # OTP is valid - delete it (single use)
    db.delete_session(otp_session_key)
    
    # Create session token
    session_token = secrets.token_hex(32)
    db.save_session(session_token, voter["voter_id"], "voter", {
        "voter_id": voter["voter_id"],
        "voter_token": voter.get("voting_token", ""),
        "name": voter["name"],
        "state": voter.get("state", "Not specified"),
        "email": email,
        "created_at": datetime.now().isoformat()
    })
    
    print(f"✅ Voter logged in successfully: {voter['voter_id']}")
    
    return {
        "success": True,
        "voter_id": voter["voter_id"],
        "voter_token": voter.get("voting_token", ""),
        "name": voter["name"],
        "state": voter.get("state", "Not specified"),
        "session_token": session_token,
        "message": "Login successful!"
    }


@app.post("/api/voter/request-otp-signup")
async def request_otp_signup(data: Dict):
    aadhaar_number = data.get("aadhaar_number")
    phone = data.get("phone")
    name = data.get("name")
    
    if not aadhaar_number or len(aadhaar_number) != 12:
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number")
    if not phone or len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")
        
    # Ensure phone is in international format (+91xxxxxxxxxx)
    if not phone.startswith("+"):
        phone = "+91" + phone if phone.startswith("91") else "+91" + phone
    
    # Check if voter already exists (from admin upload)
    voter = db.get_voter_by_aadhaar(aadhaar_number)
    
    # If they are already uploaded by admin, maybe they have a preset phone. 
    # But we will trust the phone they provide and just use it for OTP.
    
    otp_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    otp_session_key = f"otp_reg_{aadhaar_number}"
    
    try:
        db.delete_session(otp_session_key)
    except:
        pass
        
    db.save_session(otp_session_key, aadhaar_number, "otp_reg", {
        "otp": otp_code,
        "phone": phone,
        "name": name,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(minutes=5)).isoformat()
    })
    
    print(f"\n{'='*60}")
    print(f"?? REGISTRATION OTP GENERATED FOR AADHAAR: {aadhaar_number[:4]}****{aadhaar_number[-4:]}")
    print(f"?? Phone: {phone}")
    print(f"?? OTP CODE: {otp_code}")
    print(f"? Valid for: 5 minutes")
    print(f"{'='*60}\n")
    
    # Sending SMS Fallback system (Twilio priority, then Textbelt, then console)
    sms_sent = send_otp_sms(phone, otp_code, "Registration")
    
    masked_phone = "***" + phone[-4:] if len(phone) >= 4 else "local-mode"
    
    return {
        "success": True,
        "message": f"OTP sent to {masked_phone} via SMS. Check your messages.",
        "phone_masked": masked_phone,
        "otp_hint": f"OTP starts with {otp_code[:2]}**",
        "expires_in": "5 minutes"
    }

@app.post("/api/voter/register")
async def register_voter(registration: VoterRegistration):
    """Complete voter registration after OTP verification."""
    
    otp_session_key = f"otp_reg_{registration.aadhaar_number}"
    otp_session = db.get_session(otp_session_key)
    
    if not otp_session:
        raise HTTPException(status_code=401, detail="OTP expired or not found. Please request a new OTP.")
    
    expires_at = datetime.fromisoformat(otp_session.get("expires_at", ""))
    if datetime.now() > expires_at:
        db.delete_session(otp_session_key)
        raise HTTPException(status_code=401, detail="OTP expired after 5 minutes. Please request a new OTP.")
        
    if otp_session.get("otp") == registration.otp:
        pass # Valid local terminal OTP
    else:
        import os
        from twilio.rest import Client
        twilio_verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        if twilio_verify_sid:
            try:
                client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
                phone_to_verify = otp_session.get("phone")
                if not phone_to_verify:
                     phone_to_verify = registration.phone
                     if not phone_to_verify.startswith("+"): phone_to_verify = "+91" + phone_to_verify[-10:]
                verification_check = client.verify.v2.services(twilio_verify_sid).verification_checks.create(to=phone_to_verify, code=registration.otp)
                if verification_check.status != "approved":
                    raise HTTPException(status_code=401, detail="Invalid OTP. Please check and try again.")
            except Exception as e:
                if isinstance(e, HTTPException): raise e
                raise HTTPException(status_code=401, detail=f"Invalid Twilio OTP or verification failed.")
        else:
            raise HTTPException(status_code=401, detail="Invalid OTP. Please check and try again.")
        
    db.delete_session(otp_session_key)
    
    # Generate keys and insert!
    voter_id = f"VOT{secrets.token_hex(4).upper()}"
    voting_token = secrets.token_hex(32)
    
    phone = registration.phone
    if not phone.startswith("+"):
        phone = "+91" + phone if phone.startswith("91") else "+91" + phone
        
    voter_data = {
        'voter_id': voter_id,
        'voting_token': voting_token,
        'name': registration.name or otp_session.get("name"),
        'aadhaar': registration.aadhaar_number,
        'state': registration.state,
        'phone': phone,
        'registered_at': datetime.now().isoformat()
    }
    
    try:
        result = db.register_voter(voter_data)
        if result is False or (isinstance(result, dict) and not result.get("success", True)):
            # If voter already existed, just return their existing token or error
            existing_voter = db.get_voter_by_aadhaar(registration.aadhaar_number)
            if existing_voter:
                session_token = secrets.token_hex(32)
                db.save_session(session_token, existing_voter["voter_id"], "voter", {
                    "voter_id": existing_voter["voter_id"],
                    "voter_token": existing_voter["voting_token"],
                    "name": existing_voter["name"],
                    "state": existing_voter.get("state", "Not specified"),
                    "created_at": datetime.now().isoformat()
                })
                return {
                    "success": True,
                    "already_registered": True,
                    "voter_id": existing_voter["voter_id"],
                    "voter_token": existing_voter["voting_token"],
                    "name": existing_voter["name"],
                    "state": existing_voter.get("state", "Not specified"),
                    "session_token": session_token
                }
            raise HTTPException(status_code=400, detail="Database registration failed")
            
    except Exception as e:
        print(f"Error saving voter to database: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    session_token = secrets.token_hex(32)
    db.save_session(session_token, voter_data["voter_id"], "voter", {
        "voter_id": voter_data["voter_id"],
        "voter_token": voter_data["voting_token"],
        "name": voter_data["name"],
        "state": voter_data["state"],
        "created_at": datetime.now().isoformat()
    })

    return {
        "success": True,
        "voter_id": voter_data["voter_id"],
        "voter_token": voter_data["voting_token"],
        "name": voter_data["name"],
        "state": voter_data["state"],
        "session_token": session_token,
        "message": "Registration successful! Save your Voter ID and Token securely."
    }


@app.post("/api/voter/login")
async def voter_login(login: VoterLogin):
    """Voter login endpoint."""
    voter = db.get_voter(login.voter_id)
    
    if not voter:
        raise HTTPException(status_code=404, detail="Voter ID not found")
    
    session_token = secrets.token_hex(32)
    # Save session with correct parameters: (session_token, user_id, session_type, user_data)
    db.save_session(session_token, login.voter_id, "voter", {
        "voter_id": login.voter_id,
        "voter_token": voter["voting_token"],
        "name": voter["name"],
        "state": voter.get("state", "Not specified"),
        "created_at": datetime.now().isoformat()
    })
    
    return {
        "success": True,
        "session_token": session_token,
        "voter_id": login.voter_id,
        "name": voter["name"],
        "state": voter.get("state", "Not specified"),
        "voter_token": voter["voting_token"]
    }


@app.post("/api/admin/elections")
async def create_election(election_data: ElectionCreate, request: Request):
    """Create a new election (admin only) for specific state."""
    session = check_admin_access(request)
    
    # Verify admin can create elections for this state
    admin_state = session.get("state")
    if admin_state != "All States" and admin_state != election_data.state:
        raise HTTPException(
            status_code=403, 
            detail=f"You can only create elections for {admin_state}"
        )
    
    election_id = secrets.token_hex(8)
    
    election = {
        "id": election_id,
        "title": election_data.title,
        "description": election_data.description,
        "state": election_data.state,
        "start_time": election_data.start_time,
        "end_time": election_data.end_time,
        "candidates": [c.dict() for c in election_data.candidates],
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "created_by": session.get("username")
    }
    
    db.save_election(election)
    
    return {
        "success": True,
        "election_id": election_id,
        "state": election_data.state,
        "message": f"Election created successfully for {election_data.state}"
    }


@app.get("/api/elections")
async def get_elections(request: Request):
    """Get elections filtered by user's state."""
    # Try to get session to determine user type and state
    auth_header = request.headers.get("Authorization")
    
    if auth_header:
        session = db.get_session(auth_header.replace("Bearer ", ""))
        if session:
            user_state = session.get("state")
            user_type = session.get("type")
            
            # Get all elections
            all_elections = db.get_all_elections()
            
            # Filter by state if not "All States" (for state admins and voters)
            if user_state and user_state != "All States":
                elections = [e for e in all_elections if e.get("state") == user_state]
            else:
                # Super admin sees all elections
                elections = all_elections
            
            return {
                "elections": elections, 
                "state": user_state,
                "is_super_admin": user_state == "All States"
            }
    
    # No auth - return empty or public elections only
    return {"elections": [], "state": None, "is_super_admin": False}


@app.get("/api/states")
async def get_states():
    """Get list of Indian states for dropdown."""
    return {"states": INDIAN_STATES}


@app.get("/api/elections/{election_id}")
async def get_election(election_id: str):
    """Get election details."""
    election = db.get_election_by_id(election_id)
    
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    return election


@app.get("/api/admin/dashboard")
async def get_dashboard_stats(request: Request):
    """Get dashboard statistics for admin."""
    session = check_admin_access(request)
    
    elections = db.get_all_elections()
    voters = db.get_all_voters()
    
    # Filter by state if not super admin
    admin_state = session.get("state")
    if admin_state != "All States":
        elections = [e for e in elections if e.get("state") == admin_state]
        voters = [v for v in voters if v.get("state") == admin_state]
    
    total_votes = sum(len(db.get_votes_by_election(e["id"])) for e in elections)
    
    return {
        "elections": len(elections),
        "voters": len(voters),
        "votes": total_votes,
        "admin_state": admin_state,
        "is_super_admin": admin_state == "All States"
    }


@app.get("/api/admin/voters")
async def get_voters(request: Request):
    """Get voters filtered by admin's state."""
    session = check_admin_access(request)
    
    all_voters = db.get_all_voters()
    
    # Filter by state if not super admin
    admin_state = session.get("state")
    if admin_state != "All States":
        voters = [v for v in all_voters if v.get("state") == admin_state]
    else:
        voters = all_voters
    
    return {
        "voters": voters,
        "total": len(voters),
        "admin_state": admin_state
    }


@app.post("/api/admin/import-voters")
async def import_voters(request: Request, file: UploadFile = File(...)):
    """Import voters from CSV file (admin only)."""
    session = check_admin_access(request)
    admin_state = session.get("state")
    
    try:
        # Read file content
        contents = await file.read()
        
        # We will parse CSV specifically (pandas is disabled to bypass AppLocker)
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only .csv files are supported. Please convert your Excel file to CSV format.")
        
        import csv
        import io
        import secrets
        
        text_content = contents.decode("utf-8")
        
        # Read the CSV
        csv_file = io.StringIO(text_content)
        reader = csv.DictReader(csv_file)
        
        # Normalize headers to lowercase
        headers = [h.strip().lower() for h in reader.fieldnames] if reader.fieldnames else []
        
        # Map columns
        column_mapping = {'aadhaar_number': 'aadhaar'}
        mapped_headers = [column_mapping.get(h, h) for h in headers]
        
        reader.fieldnames = mapped_headers
        
        required_columns = ['name', 'aadhaar', 'state', 'phone']
        missing_columns = [col for col in required_columns if col not in mapped_headers]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}. Required: name, aadhaar_number, state, phone"
            )
        
        # Import voters
        imported_count = 0
        errors = []
        
        for index, row in enumerate(reader):
            try:
                voter_state = str(row.get('state', '')).strip()
                aadhaar = str(row.get('aadhaar', '')).strip()
                name = str(row.get('name', '')).strip()
                
                # Check if phone exists in row
                phone = None
                if 'phone' in row:
                    p = str(row.get('phone', '')).strip()
                    if p:
                        phone = p
                
                # Validate state
                if admin_state != "All States" and voter_state != admin_state:
                    errors.append({
                        "row": index + 2,
                        "error": f"State admin can only import voters for {admin_state}"
                    })
                    continue
                
                # Validate Aadhaar number
                if len(aadhaar) != 12 or not aadhaar.isdigit():
                    errors.append({
                        "row": index + 2,
                        "error": f"Invalid Aadhaar number: {aadhaar} (must be 12 digits)"
                    })
                    continue
                
                # Generate unique ID and token
                voter_id = f"VOT{secrets.token_hex(4).upper()}"
                voting_token = secrets.token_hex(32)
                
                voter_data = {
                    'voter_id': voter_id,
                    'voting_token': voting_token,
                    'name': name,
                    'aadhaar': aadhaar,
                    'state': voter_state,
                    'phone': phone
                }
                
                # Register voter using Database wrapper which encrypts
                result = db.register_voter(voter_data)
                
                # In JSON db it returns True/False. In Supabase it returns a dict.
                if result is False:
                    errors.append({
                        "row": index + 2,
                        "error": "Voter ID already exists"
                    })
                else:
                    imported_count += 1
                    
            except Exception as row_error:
                errors.append({
                    "row": index + 2,
                    "error": str(row_error)
                })
        
        return JSONResponse({
            "success": True,
            "message": f"Import complete: {imported_count} voters imported, {len(errors)} errors found.",
            "imported_count": imported_count,
            "error_count": len(errors),
            "errors": errors[:50]  # Limit returned errors
        })
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"Import error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.get("/api/admin/download-voter-template")
async def download_voter_template(request: Request):
    """
    Download sample voter data template (Excel format).
    Requires admin authentication.
    """
    from fastapi.responses import StreamingResponse
    
    # Check admin access
    check_admin_access(request)
    
    try:
        raise HTTPException(status_code=400, detail="Import currently disabled due to system DLL policy (AppLocker blocking Pandas).")
        # Create sample data
        sample_data = pd.DataFrame({
            'state': ['Maharashtra', 'Delhi', 'Karnataka'],
            'aadhaar_number': ['123456789012', '234567890123', '345678901234'],
            'name': ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel']
        })
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            sample_data.to_excel(writer, index=False, sheet_name='Voter Data')
        
        output.seek(0)
        
        # Return file as download
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": "attachment; filename=voter_import_template.xlsx"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate template: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # Run on localhost only (not 0.0.0.0)
    uvicorn.run(app, host="localhost", port=5000, reload=False)

