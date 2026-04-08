import sys
sys.path.append('.')
from backend.secure_supabase_db import db

print("Attempting to delete all voters...")
res = db.client.table('voters').delete().neq('id', 0).execute()
print(f"Result: {res}")
print("All voters data removed from Supabase.")
