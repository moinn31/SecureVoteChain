import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Add TextBelt fallback
text = text.replace(
'''    except Exception as sms_error:
        print(f"?? Supabase SMS failed: {sms_error}")
        print(f"?? Use the OTP shown above in terminal: {otp_code}")''',
'''    except Exception as sms_error:
        print(f"?? Supabase SMS failed: {sms_error}")
        print(f"?? Use the OTP shown above in terminal: {otp_code}")
        
        # Try free TextBelt API to ensure user gets the OTP
        import requests
        try:
            print(f"?? Attempting to send SMS via TextBelt fallback API to {phone}...")
            resp = requests.post('https://textbelt.com/text', {
                'phone': phone,
                'message': f'SecureVoteChain Login OTP: {otp_code}. DO NOT share this code.',
                'key': 'textbelt',
            })
            resp_data = resp.json()
            if resp_data.get('success'):
                print(f"? SMS sent successfully via TextBelt fallback to {phone}")
            else:
                print(f"?? TextBelt Backup SMS failed (1 per day limit?): {resp_data}")
        except Exception as fallback_error:
            print(f"?? TextBelt fallback error: {fallback_error}")'''
)

# Remove pandas import
text = text.replace('import pandas as pd\n', 'import csv\n')

# Disable import-voters route
import_route = re.search(r'(@app\.post\("/api/admin/import-voters"\).*?raise HTTPException\([^)]+\))', text, re.DOTALL)
if import_route:
    text = text.replace(import_route.group(1), '''@app.post("/api/admin/import-voters")
async def import_voters(request: Request, file: UploadFile = File(...)):
    raise HTTPException(status_code=400, detail="Import currently disabled due to system DLL policy.")''')

# Disable download-template route
download_route = re.search(r'(@app\.get\("/api/admin/download-template"\).*?def download_template.*?return StreamingResponse\([^)]+\))', text, re.DOTALL)
if download_route:
    text = text.replace(download_route.group(1), '''@app.get("/api/admin/download-template")
async def download_template(request: Request):
    raise HTTPException(status_code=400, detail="Download currently disabled due to system DLL policy.")''')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(text)
