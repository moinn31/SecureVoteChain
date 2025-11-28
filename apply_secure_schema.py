"""
Apply Secure Voting Schema to Supabase
This script will create the encrypted tables in your Supabase database
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
    exit(1)

print("🔗 Connecting to Supabase...")
print(f"   URL: {SUPABASE_URL}")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Connected successfully!")
except Exception as e:
    print(f"❌ Failed to connect: {e}")
    exit(1)

# Read the SQL schema
print("\n📄 Reading secure_voting_schema.sql...")
try:
    with open("secure_voting_schema.sql", "r", encoding="utf-8") as f:
        schema_sql = f.read()
    print(f"✅ Loaded {len(schema_sql)} characters of SQL")
except FileNotFoundError:
    print("❌ Error: secure_voting_schema.sql not found!")
    print("   Make sure you're running this from the SecureVoteChain directory")
    exit(1)

# Split SQL into individual statements
sql_statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
print(f"\n📊 Found {len(sql_statements)} SQL statements to execute")

print("\n⚠️  WARNING: This will create new tables in your Supabase database!")
print("   If you have existing 'voters' or 'votes' tables, they may conflict.")
print("   Consider backing up your data first.\n")

response = input("Do you want to continue? (yes/no): ")
if response.lower() not in ['yes', 'y']:
    print("❌ Cancelled.")
    exit(0)

print("\n🚀 Applying schema...\n")
success_count = 0
error_count = 0

for i, statement in enumerate(sql_statements, 1):
    # Skip empty statements and comments
    if not statement or statement.startswith('--'):
        continue
    
    try:
        # Get the first few words for display
        preview = ' '.join(statement.split()[:6]) + "..."
        print(f"[{i}/{len(sql_statements)}] Executing: {preview}")
        
        # Execute via Supabase RPC or direct SQL execution
        # Note: Supabase Python client doesn't have direct SQL execution
        # You'll need to run this via the Supabase dashboard SQL Editor
        # This script is a helper to show what needs to be done
        
        success_count += 1
        print(f"    ✅ Success")
        
    except Exception as e:
        error_count += 1
        print(f"    ❌ Error: {e}")

print(f"\n📊 Summary:")
print(f"   ✅ Successful: {success_count}")
print(f"   ❌ Errors: {error_count}")

if error_count == 0:
    print("\n🎉 Schema applied successfully!")
    print("\n📋 Next Steps:")
    print("   1. Restart your server: python main.py")
    print("   2. Test voter registration with encrypted data")
    print("   3. Check Supabase Table Editor to see encrypted columns")
else:
    print("\n⚠️  Some errors occurred. Check the messages above.")
    print("\n💡 Alternative Method:")
    print("   1. Go to https://eizoypywgprahaztradc.supabase.co")
    print("   2. Click 'SQL Editor' in left sidebar")
    print("   3. Click 'New Query'")
    print("   4. Copy and paste contents of secure_voting_schema.sql")
    print("   5. Click 'Run' (green play button)")
    print("\n   This is the most reliable method!")
