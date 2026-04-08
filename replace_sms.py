import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'# Send OTP via Supabase Auth SMS\s*try:\s*if phone:\s*db\.client\.auth\.sign_in_with_otp\(\{[\s\S]*?except Exception as sms_error:\s*print\(.*?sms_error\}\"\)'
match = re.search(pattern, text)

new_block = '''# Send OTP via Twilio / Textbelt / Terminal
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
                    print(f"?? TextBelt Backup SMS failed (1 per day limit?): {resp_data}")
            except Exception as fallback_error:
                print(f"?? TextBelt fallback error: {fallback_error}")
    else:
        print("?? No phone found for voter. Using terminal OTP for local login.")'''

if match:
    text = text[:match.start()] + new_block + text[match.end():]
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced Login OTP successfully!")
else:
    print("Could not find the pattern.")
