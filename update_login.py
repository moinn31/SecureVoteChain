import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the end of request-otp logic
old_block = '''
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
    
    print(f"\\n{'='*60}")
    print(f"?? OTP GENERATED FOR AADHAAR: {aadhaar_number[:4]}****{aadhaar_number[-4:]}")
    print(f"?? Phone: {phone}")
    print(f"?? OTP CODE: {otp_code}")
    print(f"? Valid for: 5 minutes")
    print(f"{'='*60}\\n")
    
    has_phone = bool(phone)
    if not has_phone:
        print("?? No phone found for voter. Using terminal OTP for local login.")
    
    # Return masked phone for UI
    masked_phone = f"***{phone[-4:]}" if has_phone and len(phone) >= 4 else "local-mode"
    
    return {
        "success": True,
        "message": f"OTP sent to {masked_phone} via SMS. Check your messages." if has_phone else "Local test mode: Check terminal for OTP",
        "phone_masked": masked_phone,
        "otp_hint": f"OTP starts with {otp_code[:2]}**"
    }'''

new_block = '''
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
    
    print(f"\\n{'='*60}")
    print(f"?? LOGIN OTP GENERATED FOR AADHAAR: {aadhaar_number[:4]}****{aadhaar_number[-4:]}")
    print(f"?? Phone: {phone}")
    print(f"?? OTP CODE: {otp_code}")
    print(f"? Valid for: 5 minutes")
    print(f"{'='*60}\\n")
    
    has_phone = bool(phone)
    sms_sent = False
    
    if has_phone:
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        if twilio_sid and twilio_token and twilio_phone:
            try:
                from twilio.rest import Client
                client = Client(twilio_sid, twilio_token)
                message = client.messages.create(
                    body=f'SecureVoteChain Login OTP: {otp_code}. DO NOT share this code.',
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
                    'message': f'SecureVoteChain Login OTP: {otp_code}. DO NOT share this code.',
                    'key': 'textbelt',
                })
                resp_data = resp.json()
                if resp_data.get('success'):
                    print(f"? SMS sent successfully via TextBelt fallback to {phone}")
                    sms_sent = True
                else:
                    print(f"?? TextBelt Backup SMS failed: {resp_data}")
            except Exception as fallback_error:
                print(f"?? TextBelt fallback error: {fallback_error}")
    else:
        print("?? No phone found for voter. Using terminal OTP for local login.")
    
    # Return masked phone for UI
    masked_phone = f"***{phone[-4:]}" if has_phone and len(phone) >= 4 else "local-mode"
    
    msg = f"OTP sent to {masked_phone} via SMS." if sms_sent else ("Local test mode: Check terminal for OTP (SMS setup required/failed)." if has_phone else "Local test mode: Check terminal for OTP")
    
    return {
        "success": True,
        "message": msg,
        "phone_masked": masked_phone,
        "otp_hint": f"OTP starts with {otp_code[:2]}**"
    }'''

if old_block in text:
    text = text.replace(old_block, new_block)
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced Login OTP successfully!")
else:
    print("Could not find the exact pattern.")
