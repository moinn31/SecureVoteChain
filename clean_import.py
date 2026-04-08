import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

# Clear voters for clean test
try:
    # Delete all except the two testing users we added manually (with specific phones)
    response = supabase.table('voters').delete().neq('phone', '+919408082933').neq('phone', '+918866886330').execute()
    print("Cleared duplicate voters from database. Ready for clean CSV import.")
except Exception as e:
    print(f"Error clearing voters: {e}")
