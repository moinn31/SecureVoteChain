import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.db_config import get_database

db = get_database()
print("Attempting to delete all voters...")
# Delete all rows where aadhaar_number is not empty (effectively all)
res = db.client.table('voters').delete().neq('aadhaar_number', '0').execute()
print(f"Result: {res}")
print("All voters data removed from Supabase.")