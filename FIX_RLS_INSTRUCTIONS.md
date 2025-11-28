# 🔧 URGENT FIX: Row-Level Security (RLS) Issues

## Problem
You're seeing these errors:
- ❌ `new row violates row-level security policy for table "elections"`
- ❌ `new row violates row-level security policy for table "audit_logs"`
- ❌ Election creation fails with 500 Internal Server Error

## Root Cause
Supabase has Row-Level Security (RLS) enabled on all tables, which blocks INSERT operations from your application.

---

## 🚀 QUICK FIX (3 Steps)

### Step 1: Go to Supabase Dashboard
1. Open your browser
2. Go to: https://supabase.com/dashboard
3. Select your **SecureVoteChain** project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### Step 3: Run This SQL Script
Copy and paste this entire script, then click **"Run"**:

```sql
-- Disable RLS for all tables (allows all operations)
ALTER TABLE elections DISABLE ROW LEVEL SECURITY;
ALTER TABLE voters DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE secure_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE vote_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE anonymity_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
```

**Click the green "RUN" button at the bottom right.**

---

## ✅ Verify It Works

After running the SQL:
1. Go back to your SecureVoteChain admin panel
2. Try creating a new election
3. You should see: ✅ **"Election created successfully"**

---

## 📝 What This Does

- **Disables RLS** = Allows your application to INSERT/UPDATE/DELETE data without authentication
- **Safe for development/demo** = Perfect for testing and demonstrations
- **Not recommended for production** = In production, you'd need proper RLS policies with authentication

---

## 🎯 Candidate Photo Upload

The candidate photo upload feature is **already working correctly** in the code:
- ✅ File input added to candidate rows
- ✅ Base64 encoding implemented
- ✅ Photo display with `<img>` tags
- ✅ Fallback to emoji if no photo

**It will work once RLS is disabled!**

---

## Alternative: Keep RLS Enabled (Advanced)

If you want to keep RLS enabled with permissive policies, use this instead:

```sql
-- Enable RLS with permissive policies
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on elections" ON elections;
CREATE POLICY "Allow all operations on elections" ON elections FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on voters" ON voters;
CREATE POLICY "Allow all operations on voters" ON voters FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on votes" ON votes;
CREATE POLICY "Allow all operations on votes" ON votes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE secure_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on secure_audit_logs" ON secure_audit_logs;
CREATE POLICY "Allow all operations on secure_audit_logs" ON secure_audit_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on vote_receipts" ON vote_receipts;
CREATE POLICY "Allow all operations on vote_receipts" ON vote_receipts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE anonymity_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on anonymity_sets" ON anonymity_sets;
CREATE POLICY "Allow all operations on anonymity_sets" ON anonymity_sets FOR ALL USING (true) WITH CHECK (true);
```

---

## 🆘 Need Help?

If the SQL doesn't run:
1. Check you're in the correct project
2. Make sure you're using the **SQL Editor** (not the table editor)
3. Copy the exact script from above
4. Click **RUN** and wait for success message

---

**After fixing RLS, refresh your browser and try creating an election again!** 🎉
