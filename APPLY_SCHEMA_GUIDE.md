# 🎯 APPLY SQL SCHEMA - STEP-BY-STEP GUIDE

## ⏱️ Time Required: 5 minutes

---

## 📋 PREREQUISITES

Before you start, make sure you have:

- ✅ Supabase account created
- ✅ Project URL: `https://eizoypywgprahaztradc.supabase.co`
- ✅ API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ File: `secure_voting_schema.sql` (in your project folder)

---

## 🚀 METHOD 1: Supabase SQL Editor (RECOMMENDED)

### Step 1: Open Supabase Dashboard

1. Open your browser (Chrome, Firefox, Edge, etc.)
2. Navigate to: **https://eizoypywgprahaztradc.supabase.co**
3. Login with your Supabase credentials
4. You should see your project dashboard

### Step 2: Navigate to SQL Editor

1. Look at the **left sidebar**
2. Find and click on **"SQL Editor"** icon (looks like `</>`)
3. Wait for SQL Editor to load

### Step 3: Create New Query

1. Click the **"+ New Query"** button (top left)
2. You'll see an empty SQL editor window
3. The editor has:
   - Left side: Query name field
   - Center: SQL code editor (large text area)
   - Top right: **"Run"** button (green play icon ▶️)

### Step 4: Open SQL Schema File

1. Open File Explorer on your computer
2. Navigate to: `C:\Users\moinm\Desktop\SecureVoteChain\`
3. Find file: `secure_voting_schema.sql`
4. Right-click → **Open with** → **Notepad** (or VS Code)

### Step 5: Copy SQL Schema

1. In the opened `secure_voting_schema.sql` file:
   - Press **Ctrl + A** (Select All)
   - Press **Ctrl + C** (Copy)
2. You should see ~300 lines of SQL code copied

### Step 6: Paste into Supabase

1. Go back to Supabase SQL Editor (browser tab)
2. Click inside the large SQL editor area
3. Press **Ctrl + V** (Paste)
4. You should see all the SQL code appear:
   ```sql
   -- 🔒 Secure Voting System Database Schema
   -- Zero-Knowledge Proofs + Ring Signatures + Encryption
   
   -- Drop existing tables if they exist
   DROP TABLE IF EXISTS votes CASCADE;
   ...
   ```

### Step 7: Run the Schema

1. **IMPORTANT:** Read the warning at the top of the SQL file
2. If you have existing data, **BACKUP FIRST!**
3. Click the green **"Run"** button (top right, ▶️ icon)
4. Wait for execution...

### Step 8: Verify Success

**You should see:**

```
Success. No rows returned
Query executed in XX ms
```

**If you see errors:**
- Most common: "table already exists"
- Solution: The SQL starts with `DROP TABLE IF EXISTS...` so it should handle this
- If errors persist, see troubleshooting below

### Step 9: Verify Tables Created

1. Click **"Table Editor"** in left sidebar
2. You should now see new tables:
   - ✅ `voters` (with columns: voter_id, aadhaar_encrypted, name_encrypted, etc.)
   - ✅ `votes` (with columns: vote_id, commitment, candidate_encrypted, etc.)
   - ✅ `vote_receipts`
   - ✅ `anonymity_sets`
   - ✅ `secure_audit_logs`

### Step 10: Check Column Types

Click on **voters** table:

```
Columns:
├─ voter_id (TEXT, Primary Key)
├─ aadhaar_encrypted (TEXT) ← Should see this!
├─ name_encrypted (TEXT) ← Should see this!
├─ state (TEXT)
├─ voter_token_hash (TEXT)
├─ public_key (TEXT)
└─ created_at (TIMESTAMP)
```

Click on **votes** table:

```
Columns:
├─ vote_id (UUID, Primary Key)
├─ election_id (TEXT)
├─ commitment (TEXT) ← ZKP commitment!
├─ candidate_encrypted (TEXT) ← Encrypted vote!
├─ proof_hash (TEXT)
├─ ring_signature (JSONB) ← Ring signature!
├─ transaction_hash (TEXT)
└─ created_at (TIMESTAMP)
```

**✅ If you see these columns, SUCCESS!**

---

## 🛠️ METHOD 2: Using Supabase CLI (Advanced)

### Prerequisites:
- Supabase CLI installed
- Project linked to Supabase

### Steps:

```powershell
# 1. Install Supabase CLI (if not already installed)
scoop install supabase

# 2. Login to Supabase
supabase login

# 3. Link your project
supabase link --project-ref eizoypywgprahaztradc

# 4. Run migrations
supabase db push

# 5. Apply schema
supabase db reset --db-url "postgresql://postgres:your-password@db.eizoypywgprahaztradc.supabase.co:5432/postgres"
```

---

## ⚠️ TROUBLESHOOTING

### Error: "relation 'voters' already exists"

**Cause:** You already have a `voters` table from the old schema

**Solution 1 - Keep old data:**
```sql
-- Rename old tables
ALTER TABLE voters RENAME TO voters_old;
ALTER TABLE votes RENAME TO votes_old;

-- Then run the new schema
-- (Paste secure_voting_schema.sql and run)
```

**Solution 2 - Fresh start:**
```sql
-- Delete old tables (WARNING: Deletes all data!)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS voters CASCADE;
DROP TABLE IF EXISTS elections CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Then run the new schema
-- (Paste secure_voting_schema.sql and run)
```

### Error: "must be owner of table voters"

**Cause:** Permission issue

**Solution:**
1. Go to Supabase Dashboard → **Settings** → **Database**
2. Copy the **Database password**
3. Use SQL Editor as postgres user (default)

### Error: "syntax error at or near..."

**Cause:** Copy-paste didn't work correctly

**Solution:**
1. Make sure you copied the ENTIRE SQL file
2. Check for special characters that didn't paste correctly
3. Try copying in smaller chunks (100 lines at a time)

### Error: "timeout"

**Cause:** SQL file too large or network issue

**Solution:**
1. Split SQL into smaller chunks
2. Run table creation separately:
   - First: Create tables (lines 1-150)
   - Then: Create policies (lines 151-250)
   - Finally: Create views (lines 251-end)

### Error: "function does not exist"

**Cause:** Missing PostgreSQL extensions

**Solution:**
```sql
-- Run this first:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Then run the schema
```

---

## 🔍 VERIFICATION CHECKLIST

After running the schema, verify:

### ✅ Check 1: Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

Expected output:
- voters
- votes
- vote_receipts
- anonymity_sets
- secure_audit_logs
- elections (if already existed)
```

### ✅ Check 2: Encrypted Columns Exist
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'voters';

Expected output should include:
- aadhaar_encrypted (text)
- name_encrypted (text)
- voter_token_hash (text)
```

### ✅ Check 3: No Plain Text Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'voters' 
  AND column_name IN ('aadhaar_number', 'name');

Expected output: 0 rows (these columns should NOT exist!)
```

### ✅ Check 4: RLS Policies Applied
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

Expected output:
- voters | voters_select_policy
- votes | votes_insert_policy
- etc.
```

### ✅ Check 5: Views Created
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

Expected output:
- vote_statistics
- voter_stats_by_state
```

---

## 🎯 POST-SETUP TASKS

After successfully applying the schema:

### Task 1: Update `.env` File

Make sure your `.env` has:

```bash
# Supabase Configuration
SUPABASE_URL=https://eizoypywgprahaztradc.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpem95cHl3Z3ByYWhhenRyYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzA3MjgsImV4cCI6MjA3NzQwNjcyOH0.-n52UVcsQrSK2L-FEUp8gT38mYip8Y4871AsjPkLOhk

# Database Mode
DATABASE_MODE=supabase

# Encryption Key (CRITICAL!)
VOTE_ENCRYPTION_KEY=gAAAAABnM2HxK_8vYZqW3JtN5PxQrS7UwVmX9CdEfGhI0JkLmNo6PqRsTuVwXyZ1A2B3C4D5E6F7G8H9I0J1K2L3M4N5==
```

### Task 2: Restart Your Server

```powershell
# Stop current server (Ctrl+C)
# Then restart:
python main.py
```

**Look for this message:**
```
🔒 Using SECURE Supabase Database (Encrypted + Zero-Knowledge)
```

### Task 3: Test Voter Registration

1. Go to: http://127.0.0.1:5000
2. Register a test voter:
   - Aadhaar: `123456789012`
   - Name: `Test Voter`
   - State: `Maharashtra`
3. Check Supabase → Table Editor → voters
4. Verify you see **encrypted gibberish** in `aadhaar_encrypted` column

---

## 📊 EXPECTED OUTCOMES

### Before Schema Application:

**Supabase Tables:**
- ❌ No `voters` table (or old insecure version)
- ❌ No `votes` table (or old insecure version)
- ❌ No encryption columns

**Server Output:**
```
📁 Using JSON File Database (Development Mode)
```

### After Schema Application:

**Supabase Tables:**
- ✅ `voters` table with `aadhaar_encrypted`, `name_encrypted`
- ✅ `votes` table with `commitment`, `candidate_encrypted`, `ring_signature`
- ✅ `vote_receipts` for verification
- ✅ `anonymity_sets` for ring signatures
- ✅ `secure_audit_logs` for encrypted auditing

**Server Output:**
```
🔒 Using SECURE Supabase Database (Encrypted + Zero-Knowledge)
INFO:     Uvicorn running on http://127.0.0.1:5000 (Press CTRL+C to quit)
```

**First Voter Registration:**
- Browser shows: "Voter registered successfully"
- Supabase shows:
  ```
  aadhaar_encrypted: gAAAAABnM2Hx_8kL3mN5pQ7rS...
  name_encrypted: gAAAAABnM2Hz_9lM4nO6qR8sT...
  ```

---

## 🎉 SUCCESS INDICATORS

You'll know everything worked when:

1. ✅ SQL Editor shows **"Success. No rows returned"**
2. ✅ Table Editor shows 5+ new tables
3. ✅ `voters` table has `aadhaar_encrypted` column
4. ✅ `votes` table has `commitment` column
5. ✅ Server starts with **"🔒 Using SECURE Supabase Database"** message
6. ✅ First voter registration shows encrypted data in Supabase
7. ✅ No errors in terminal/console

---

## 📞 NEED HELP?

If you're stuck:

1. **Check the error message carefully**
   - Copy the exact error text
   - Search in this document for that error

2. **Verify prerequisites**
   - Can you login to Supabase dashboard?
   - Can you see SQL Editor?
   - Is `secure_voting_schema.sql` in your project folder?

3. **Try the simple method**
   - Copy first 50 lines of SQL
   - Run them
   - If successful, copy next 50 lines
   - Repeat until all applied

4. **Check screenshots online**
   - Search: "Supabase SQL Editor tutorial"
   - Follow visual guides

---

## ⏭️ NEXT STEPS

After schema is applied:

1. ✅ **Test the system** - Register voter, cast vote
2. ✅ **Verify encryption** - Check Supabase tables
3. ✅ **Demo to professor** - Show before/after comparison
4. 🎓 **Present with confidence!**

---

**Remember:** This is a ONE-TIME setup. Once applied, you won't need to do this again! 🚀
