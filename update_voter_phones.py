import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
try:
    supabase = create_client(url, key)
    
    response = supabase.table('voters').select('*').limit(2).execute()
    data = response.data
    if len(data) >= 2:
        voter1 = data[0]
        voter2 = data[1]
        
        supabase.table('voters').update({'phone': '9408082933'}).eq('aadhaar_number', voter1['aadhaar_number']).execute()
        print(f"Updated {voter1['full_name']} (Aadhaar: {voter1['aadhaar_number']}) with phone 9408082933")
        
        supabase.table('voters').update({'phone': '8866886330'}).eq('aadhaar_number', voter2['aadhaar_number']).execute()
        print(f"Updated {voter2['full_name']} (Aadhaar: {voter2['aadhaar_number']}) with phone 8866886330")
    else:
        print('Not enough voters')
except Exception as e:
    print(f'Error: {e}')
