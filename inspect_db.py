import os
import sys
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Set stdout/stderr to UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_KEY", "")

print(f"Connecting to: {supabase_url}")
client: Client = create_client(supabase_url, supabase_key)

print("\n--- Reading elections ---")
try:
    response = client.table('elections').select('*').limit(3).execute()
    print("Successfully connected and fetched from 'elections' table.")
    print(f"Number of records returned: {len(response.data)}")
    if response.data:
        print("Record 0 keys and values:")
        for k, v in response.data[0].items():
            print(f"  {k} ({type(v).__name__}): {repr(v)}")
except Exception as e:
    print(f"Error querying elections: {e}")
