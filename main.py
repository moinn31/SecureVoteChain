from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import io
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
    
    # Send OTP via Supabase Auth SMS
    try:
        if phone:
            db.client.auth.sign_in_with_otp({
                "phone": phone,
                "options": {
                    "should_create_user": True
                }
            })
            print(f"✅ SMS sent via Supabase to {phone}")
            print(f"📱 SMS will contain OTP code")
        else:
            print("ℹ️ No phone found for voter. Using terminal OTP for local login.")
    except Exception as sms_error:
        print(f"⚠️ Supabase SMS failed: {sms_error}")
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
    if stored_otp != otp_code:
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


@app.post("/api/voter/register")
async def register_voter(registration: VoterRegistration):
    """Register a new voter with state information."""
    existing_voter = db.get_voter_by_aadhaar(registration.aadhaar_number)
    if existing_voter:
        return {
            "success": True,
            "already_registered": True,
            "voter_id": existing_voter["voter_id"],
            "voter_token": existing_voter["voting_token"],
            "name": existing_voter["name"],
            "state": existing_voter.get("state", "Not specified")
        }
    
    success, voter_data, error = VoterAuth.register_voter(
        registration.aadhaar_number,
        registration.otp,
        registration.state
    )
    
    if not success or voter_data is None:
        raise HTTPException(status_code=400, detail=error or "Registration failed")
    
    try:
        db.register_voter(voter_data)
    except Exception as e:
        print(f"Error saving voter to database: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {
        "success": True,
        "voter_id": voter_data["voter_id"],
        "voter_token": voter_data["voting_token"],
        "name": voter_data["name"],
        "state": voter_data["state"],
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
    """Import voters from CSV/Excel file (admin only)."""
    session = check_admin_access(request)
    admin_state = session.get("state")
    
    try:
        # Read file content
        contents = await file.read()
        
        # Determine file type and parse
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file format. Use CSV or Excel (.xlsx, .xls)")
        
        # Validate required columns
        df.columns = df.columns.str.strip().str.lower()
        
        # Map columns to expected names if they differ
        column_mapping = {
            'aadhaar_number': 'aadhaar'
        }
        df = df.rename(columns=column_mapping)
        
        required_columns = ['name', 'aadhaar', 'state', 'phone']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}. Required: name, aadhaar, state, phone"
            )
        
        # Import voters
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                voter_state = str(row['state']).strip()
                aadhaar = str(row['aadhaar']).strip()
                name = str(row['name']).strip()
                phone = str(row['phone']).strip() if 'phone' in df.columns else None
                
                # Validate state admin can only import voters for their state
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
                
                # Validate phone format
                if phone and (len(phone) < 10 or not phone.isdigit()):
                    errors.append({
                        "row": index + 2,
                        "error": f"Invalid phone format: {phone}"
                    })
                    continue
                
                # Validate state is in INDIAN_STATES
                if voter_state not in INDIAN_STATES:
                    errors.append({
                        "row": index + 2,
                        "error": f"Invalid state: {voter_state}. Must be a valid Indian state/UT."
                    })
                    continue
                
                # Check if voter already exists by Aadhaar
                existing_voter = db.get_voter_by_aadhaar(aadhaar)
                if existing_voter:
                    errors.append({
                        "row": index + 2,
                        "error": f"Voter with Aadhaar {aadhaar} already exists"
                    })
                    continue
                
                # Generate voter ID and token
                voter_id = f"V{secrets.token_hex(6).upper()}"
                voter_token = secrets.token_hex(16)
                
                # Register voter using register_voter method
                voter_data = {
                    "voter_id": voter_id,
                    "name": name,
                    "aadhaar": aadhaar,
                    "state": voter_state,
                    "voting_token": voter_token,
                    "phone": phone
                }
                
                db.register_voter(voter_data)
                imported_count += 1
                
            except Exception as e:
                errors.append({
                    "row": index + 2,
                    "error": str(e)
                })
        
        return {
            "success": True,
            "imported": imported_count,
            "total_rows": len(df),
            "errors": errors,
            "message": f"Successfully imported {imported_count} voters"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"❌ Error importing voters: {str(e)}")
        print(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error importing voters: {str(e)}")


@app.get("/api/voters")
async def get_voters_deprecated(request: Request):
    """Get all voters (admin only) - deprecated, use /api/admin/voters."""
    session = check_admin_access(request)
    
    all_voters = db.get_all_voters()
    
    # Filter by state if not super admin
    admin_state = session.get("state")
    if admin_state != "All States":
        voters = [v for v in all_voters if v.get("state") == admin_state]
    else:
        voters = all_voters
    
    return {"voters": voters, "total": len(voters)}


@app.get("/api/votes")
async def get_all_votes(request: Request):
    """Get all votes (admin only)."""
    session = check_admin_access(request)
    
    elections = db.get_all_elections()
    
    # Filter by state if not super admin
    if session.get("state") != "All States":
        elections = [e for e in elections if e.get("state") == session.get("state")]
    
    all_votes = []
    for election in elections:
        votes = db.get_votes_by_election(election["id"])
        all_votes.extend(votes)
    
    return {"votes": all_votes}


@app.post("/api/vote")
async def cast_vote(vote: VoteRequest, request: Request):
    """Cast a vote - voters can only vote in their state's elections."""
    session = check_voter_access(request)
    
    print(f"🗳️ Vote request - Election ID: {vote.election_id}, Candidate ID: {vote.candidate_id}")
    
    if session.get("voter_token") != vote.voter_token:
        raise HTTPException(status_code=403, detail="Invalid voter token")
    
    election = db.get_election_by_id(vote.election_id)
    if not election:
        print(f"❌ Election not found: {vote.election_id}")
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Verify voter is voting in their state's election
    voter_state = session.get("state")
    election_state = election.get("state")
    
    if voter_state != election_state:
        raise HTTPException(
            status_code=403, 
            detail=f"You can only vote in {voter_state} elections"
        )
    
    if election["status"] != "active":
        raise HTTPException(status_code=400, detail="Election is not active")
    
    if db.has_voted(vote.election_id, vote.voter_token):
        raise HTTPException(status_code=400, detail="You have already voted in this election")
    
    vote_data = {
        "election_id": vote.election_id,
        "candidate_id": vote.candidate_id,
        "voter_token": vote.voter_token,
        "state": voter_state,
        "timestamp": datetime.now().isoformat()
    }
    
    transaction_hash = db.record_vote(vote_data)
    
    return {
        "success": True,
        "transaction_hash": transaction_hash,
        "message": "Vote recorded successfully on blockchain"
    }


@app.get("/api/vote-status/{election_id}")
async def check_vote_status(election_id: str, request: Request):
    """Check if the current voter has already voted in an election."""
    session = check_voter_access(request)
    
    voter_token = session.get("voter_token")
    has_voted = db.has_voted(election_id, voter_token)
    
    return {
        "has_voted": has_voted,
        "election_id": election_id
    }


@app.post("/api/verify-vote")
async def verify_vote(verification: VoteVerification):
    """Verify a vote using transaction hash."""
    block = db.blockchain.get_block_by_hash(verification.transaction_hash)
    
    if not block:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "success": True,
        "block": block,
        "verified": True,
        "message": "Vote verified on blockchain"
    }


@app.get("/api/elections/{election_id}/results")
async def get_results(election_id: str):
    """Get election results."""
    election = db.get_election_by_id(election_id)
    
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    results = db.get_election_results(election_id)
    
    # Parse candidates if it's a JSON string
    candidates = election.get("candidates", [])
    if isinstance(candidates, str):
        import json
        try:
            candidates = json.loads(candidates)
        except:
            candidates = []
    
    candidates_with_votes = []
    for candidate in candidates:
        candidates_with_votes.append({
            **candidate,
            "votes": results.get(candidate["id"], 0)
        })
    
    total_votes = sum(results.values())
    
    return {
        "election": election,
        "results": candidates_with_votes,
        "total_votes": total_votes
    }


@app.get("/api/elections/{election_id}/export")
async def export_election_results(request: Request, election_id: str, format: str = "json"):
    """Export election results in JSON or CSV format (Admin only)."""
    session = check_admin_access(request)
    
    election = db.get_election_by_id(election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Check if admin has access to this state's election
    admin_state = session.get("state")
    admin_role = session.get("role")
    
    if admin_role != "super_admin" and election["state"] != admin_state:
        raise HTTPException(
            status_code=403, 
            detail=f"Access denied. You can only export results for {admin_state} elections."
        )
    
    results = db.get_election_results(election_id)
    votes = db.get_votes_by_election(election_id)
    
    export_data = {
        "election_id": election_id,
        "title": election["title"],
        "state": election["state"],
        "description": election.get("description", ""),
        "status": election["status"],
        "start_time": election.get("start_time"),
        "end_time": election.get("end_time"),
        "total_votes": len(votes),
        "results": []
    }
    
    for candidate in election["candidates"]:
        vote_count = results.get(candidate["id"], 0)
        percentage = (vote_count / len(votes) * 100) if len(votes) > 0 else 0
        export_data["results"].append({
            "candidate_id": candidate["id"],
            "candidate_name": candidate["name"],
            "party": candidate["party"],
            "symbol": candidate.get("symbol", ""),
            "votes": vote_count,
            "percentage": round(percentage, 2)
        })
    
    # Sort by votes descending
    export_data["results"].sort(key=lambda x: x["votes"], reverse=True)
    
    if format.lower() == "csv":
        # Create CSV format
        from fastapi.responses import StreamingResponse
        import io
        import csv
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write election info
        writer.writerow(["Election Information"])
        writer.writerow(["Title", export_data["title"]])
        writer.writerow(["State", export_data["state"]])
        writer.writerow(["Status", export_data["status"]])
        writer.writerow(["Total Votes", export_data["total_votes"]])
        writer.writerow([])
        
        # Write results header
        writer.writerow(["Rank", "Candidate Name", "Party", "Symbol", "Votes", "Percentage"])
        
        # Write results data
        for idx, result in enumerate(export_data["results"], 1):
            writer.writerow([
                idx,
                result["candidate_name"],
                result["party"],
                result["symbol"],
                result["votes"],
                f"{result['percentage']}%"
            ])
        
        output.seek(0)
        filename = f"election_results_{election_id}_{election['state']}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        # Return JSON format
        from fastapi.responses import JSONResponse
        filename = f"election_results_{election_id}_{election['state']}.json"
        
        return JSONResponse(
            content=export_data,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )


@app.get("/api/blockchain")
async def get_blockchain():
    """Get the entire blockchain (for transparency)."""
    return {
        "chain": db.blockchain.get_chain(),
        "length": len(db.blockchain.chain),
        "is_valid": db.blockchain.is_chain_valid()
    }


@app.get("/api/blockchain/verify")
async def verify_blockchain():
    """Verify blockchain integrity."""
    is_valid = db.blockchain.is_chain_valid()
    
    return {
        "is_valid": is_valid,
        "chain_length": len(db.blockchain.chain),
        "message": "Blockchain is valid and tamper-proof" if is_valid else "Blockchain has been tampered with!"
    }


@app.get("/api/analytics/voter-turnout")
async def get_voter_turnout(request: Request):
    """Get voter turnout analytics by state."""
    try:
        session = check_admin_access(request)
        admin_state = session.get("state")
        
        print(f"📊 Analytics request from admin state: {admin_state}")
        
        # Get all voters
        all_voters = db.get_all_voters()
        print(f"📊 Total voters in system: {len(all_voters)}")
        
        # Get all elections to map election_id -> state
        all_elections = db.get_all_elections()
        elections_map = {e.get('id'): e.get('state') for e in all_elections if e.get('id')}

        # Get vote tracking to count unique voters who voted.
        # Prefer Supabase vote_tracking when available, otherwise derive from local votes.
        vote_tracking = []
        try:
            if hasattr(db, 'client'):
                vote_tracking_result = db.client.table('vote_tracking').select('*').execute()
                vote_tracking = vote_tracking_result.data if vote_tracking_result.data else []
                print(f"📊 Total vote tracking records: {len(vote_tracking)}")
        except Exception as e:
            print(f"⚠️ Error getting vote tracking: {e}")

        if not vote_tracking:
            all_votes = db.get_all_votes()
            for vote in all_votes:
                election_id = vote.get('election_id')
                # Local fallback stores voter_token instead of voter_token_hash.
                voter_identifier = vote.get('voter_token') or vote.get('voter_token_hash')
                if election_id and voter_identifier:
                    vote_tracking.append({
                        'election_id': election_id,
                        'voter_token_hash': voter_identifier
                    })
            print(f"📊 Derived vote tracking records from local votes: {len(vote_tracking)}")
        
        # Calculate statistics
        stats = {}
        
        if admin_state == "All States":
            # Super admin sees all states
            print(f"📊 Calculating stats for all states")
            for state in INDIAN_STATES:
                state_voters = [v for v in all_voters if v.get("state") == state]
                
                # Count UNIQUE voters from this state (not total votes)
                state_votes = [vt for vt in vote_tracking if elections_map.get(vt.get('election_id')) == state]
                # Get unique voter_token_hash values to count unique voters who voted
                unique_voters_who_voted = set(vt.get('voter_token_hash') for vt in state_votes if vt.get('voter_token_hash'))
                voted_count = len(unique_voters_who_voted)
                total_voters = len(state_voters)
                
                stats[state] = {
                    "total_voters": total_voters,
                    "voted_count": voted_count,
                    "turnout_percentage": round((voted_count / total_voters * 100), 2) if total_voters > 0 else 0
                }
                print(f"📊 {state}: {voted_count}/{total_voters} voters ({stats[state]['turnout_percentage']}%)")
        else:
            # State admin sees only their state
            print(f"📊 Calculating stats for {admin_state}")
            state_voters = [v for v in all_voters if v.get("state") == admin_state]
            
            # Count UNIQUE voters from this state (not total votes)
            state_votes = [vt for vt in vote_tracking if elections_map.get(vt.get('election_id')) == admin_state]
            # Get unique voter_token_hash values to count unique voters who voted
            unique_voters_who_voted = set(vt.get('voter_token_hash') for vt in state_votes if vt.get('voter_token_hash'))
            voted_count = len(unique_voters_who_voted)
            total_voters = len(state_voters)
            
            stats[admin_state] = {
                "total_voters": total_voters,
                "voted_count": voted_count,
                "turnout_percentage": round((voted_count / total_voters * 100), 2) if total_voters > 0 else 0
            }
            print(f"📊 {admin_state}: {voted_count}/{total_voters} voters ({stats[admin_state]['turnout_percentage']}%)")
        
        return {"statistics": stats}
    
    except Exception as e:
        print(f"❌ Error in voter turnout analytics: {e}")
        import traceback
        traceback.print_exc()
        # Return empty stats instead of failing
        return {"statistics": {}}


@app.get("/api/analytics/election-stats/{election_id}")
async def get_election_stats(election_id: str, request: Request):
    """Get detailed statistics for a specific election with live vote counts."""
    session = check_admin_access(request)
    
    election = db.get_election_by_id(election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Verify admin has access to this election's state
    admin_state = session.get("state")
    if admin_state != "All States" and election["state"] != admin_state:
        raise HTTPException(status_code=403, detail="Access denied to this state's election")
    
    # Get vote counts (returns dict: candidate_id -> vote_count)
    vote_counts = db.get_election_results(election_id)
    
    # Parse candidates if it's a JSON string
    candidates = election.get("candidates", [])
    if isinstance(candidates, str):
        import json
        try:
            candidates = json.loads(candidates)
        except:
            candidates = []
    
    # Calculate statistics
    total_votes = sum(vote_counts.values())
    candidate_data = []
    
    for candidate in candidates:
        votes = vote_counts.get(candidate["id"], 0)
        percentage = round((votes / total_votes * 100), 2) if total_votes > 0 else 0
        candidate_data.append({
            "name": candidate.get("name", "Unknown"),
            "party": candidate.get("party", "Independent"),
            "votes": votes,
            "percentage": percentage
        })
    
    return {
        "election_id": election_id,
        "election_title": election["title"],
        "state": election["state"],
        "total_votes": total_votes,
        "candidates": candidate_data
    }


@app.post("/api/audit-log")
async def log_admin_action(request: Request, action: dict):
    """Log administrative actions for audit trail."""
    session = check_admin_access(request)
    
    log_entry = {
        "username": session.get("username"),
        "action": f"{action.get('type')}: {action.get('details')}",
        "details": action.get("details"),
        "state": session.get("state"),
        "timestamp": datetime.now().isoformat()
    }
    
    db.save_audit_log(log_entry)
    
    return {"status": "logged"}


@app.get("/api/audit-logs")
async def get_audit_logs(request: Request, limit: int = 100):
    """Get audit logs (admin only)."""
    session = check_admin_access(request)
    admin_state = session.get("state")
    
    logs = db.get_audit_logs(limit=limit)
    if admin_state != "All States":
        logs = [log for log in logs if log.get("state") == admin_state]
    
    return {"logs": logs}


@app.get("/api/verify-vote/{transaction_hash}")
async def verify_vote_endpoint(transaction_hash: str):
    """Public endpoint to verify a vote using its transaction hash."""
    try:
        print(f"🔍 Verifying transaction hash: {transaction_hash}")
        
        # Get the blockchain chain
        chain = db.blockchain.chain
        print(f"📊 Blockchain has {len(chain)} blocks")
        
        # Search through the blockchain for this transaction
        for i, block in enumerate(chain):
            # Convert Block object to dict
            block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
            
            # Debug: print block info
            vote_data = block_dict.get("data", {})
            block_tx_hash = vote_data.get("transaction_hash", "")
            block_hash = block_dict.get("hash", "")
            
            print(f"Block {i}: tx_hash={block_tx_hash[:20]}..., block_hash={block_hash[:20]}...")
            
            # Check if transaction hash matches (check both locations)
            if block_tx_hash == transaction_hash or block_hash == transaction_hash:
                print(f"✅ Found matching block at index {i}")
                
                # Found the vote
                election_id = vote_data.get("election_id")
                
                if election_id:
                    election = db.get_election_by_id(election_id)
                    
                    return {
                        "verified": True,
                        "election_title": election.get("title", "Unknown") if election else "Unknown",
                        "state": election.get("state", "Unknown") if election else "Unknown",
                        "timestamp": block_dict.get("timestamp"),
                        "block_number": i,
                        "previous_hash": block_dict.get("previous_hash", "")[:16] + "...",
                        "current_hash": block_dict.get("hash", "")[:16] + "...",
                        "transaction_hash": block_tx_hash,
                        "message": "✅ Vote successfully verified on blockchain"
                    }
                else:
                    # Genesis block or non-vote block
                    return {
                        "verified": True,
                        "message": "✅ Block found in blockchain",
                        "block_number": i,
                        "timestamp": block_dict.get("timestamp"),
                        "current_hash": block_dict.get("hash", "")[:16] + "..."
                    }
        
        # Transaction not found - show what we have
        print(f"❌ Transaction hash not found in {len(chain)} blocks")
        print(f"Looking for: {transaction_hash}")
        
        # Debug: show all transaction hashes
        all_tx_hashes = []
        for block in chain:
            block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
            tx_hash = block_dict.get("data", {}).get("transaction_hash", "N/A")
            all_tx_hashes.append(tx_hash[:20] + "...")
        print(f"Available tx hashes: {all_tx_hashes}")
        
        raise HTTPException(
            status_code=404,
            detail=f"Transaction hash not found. Blockchain has {len(chain)} blocks. Please verify the hash and try again."
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error verifying vote: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error verifying vote: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "blockchain_valid": db.blockchain.is_chain_valid()}


@app.get("/api/public/statistics")
async def get_public_statistics():
    """Get public voting statistics - no authentication required."""
    try:
        elections = db.get_all_elections()
        votes = db.get_all_votes()
        
        # Calculate statistics by state
        state_stats = {}
        for state in INDIAN_STATES:
            state_stats[state] = {
                "total_elections": 0,
                "active_elections": 0,
                "completed_elections": 0,
                "total_votes": 0,
                "voter_turnout": 0
            }
        
        # Process elections
        for election in elections:
            state = election.get("state")
            if state in state_stats:
                state_stats[state]["total_elections"] += 1
                if election.get("status") == "active":
                    state_stats[state]["active_elections"] += 1
                elif election.get("status") == "ended":
                    state_stats[state]["completed_elections"] += 1
        
        # Process votes
        for vote in votes:
            election = db.get_election_by_id(vote.get("election_id"))
            if election:
                state = election.get("state")
                if state in state_stats:
                    state_stats[state]["total_votes"] += 1
        
        # Calculate overall statistics
        total_elections = len(elections)
        active_elections = sum(1 for e in elections if e.get("status") == "active")
        total_votes = len(votes)
        
        return {
            "success": True,
            "overall": {
                "total_elections": total_elections,
                "active_elections": active_elections,
                "total_votes": total_votes,
                "total_states": len([s for s, stats in state_stats.items() if stats["total_elections"] > 0])
            },
            "by_state": state_stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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

