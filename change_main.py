import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add /api/voter/request-otp-signup
new_endpoint = '''@app.post("/api/voter/request-otp-signup")
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
    
    print(f"\\n{'='*60}")
    print(f"?? REGISTRATION OTP GENERATED FOR AADHAAR: {aadhaar_number[:4]}****{aadhaar_number[-4:]}")
    print(f"?? Phone: {phone}")
    print(f"?? OTP CODE: {otp_code}")
    print(f"? Valid for: 5 minutes")
    print(f"{'='*60}\\n")
    
    # Sending SMS Fallback system (Twilio priority, then Textbelt, then console)
    sms_sent = False
    
    # Optional Twilio Logic
    import os
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
    
    if twilio_sid and twilio_token and twilio_phone:
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)
            message = client.messages.create(
                body=f'SecureVoteChain Registration OTP: {otp_code}. DO NOT share this code.',
                from_=twilio_phone,
                to=phone
            )
            print(f"? Twilio SMS sent successfully to {phone}")
            sms_sent = True
        except Exception as twilio_error:
            print(f"?? Twilio SMS failed: {twilio_error}")
            
    if not sms_sent:
        try:
            print(f"?? Attempting to send SMS via TextBelt API to {phone}...")
            import requests
            resp = requests.post('https://textbelt.com/text', {
                'phone': phone,
                'message': f'SecureVoteChain Registration OTP: {otp_code}. DO NOT share this code.',
                'key': 'textbelt',
            })
            resp_data = resp.json()
            if resp_data.get('success'):
                print(f"? SMS sent successfully via TextBelt fallback to {phone}")
            else:
                print(f"?? TextBelt Backup SMS failed (1 per day limit?): {resp_data}")
        except Exception as fallback_error:
            print(f"?? TextBelt fallback error: {fallback_error}")
    
    masked_phone = "***" + phone[-4:] if len(phone) >= 4 else "local-mode"
    
    return {
        "success": True,
        "message": f"OTP sent to {masked_phone} via SMS. Check your messages.",
        "phone_masked": masked_phone,
        "otp_hint": f"OTP starts with {otp_code[:2]}**",
        "expires_in": "5 minutes"
    }

@app.post("/api/voter/register")'''

text = text.replace('@app.post("/api/voter/register")', new_endpoint)

# 2. Update register_voter route logic
old_reg = '''async def register_voter(registration: VoterRegistration):
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
    }'''

new_reg = '''async def register_voter(registration: VoterRegistration):
    """Complete voter registration after OTP verification."""
    
    otp_session_key = f"otp_reg_{registration.aadhaar_number}"
    otp_session = db.get_session(otp_session_key)
    
    if not otp_session:
        raise HTTPException(status_code=401, detail="OTP expired or not found. Please request a new OTP.")
    
    expires_at = datetime.fromisoformat(otp_session.get("expires_at", ""))
    if datetime.now() > expires_at:
        db.delete_session(otp_session_key)
        raise HTTPException(status_code=401, detail="OTP expired after 5 minutes. Please request a new OTP.")
        
    if otp_session.get("otp") != registration.otp:
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
        'phone': phone
    }
    
    try:
        result = db.register_voter(voter_data)
        if result is False or (isinstance(result, dict) and not result.get("success", True)):
            # If voter already existed, just return their existing token or error
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
            raise HTTPException(status_code=400, detail="Database registration failed")
            
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
    }'''

text = text.replace(old_reg, new_reg)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(text)
