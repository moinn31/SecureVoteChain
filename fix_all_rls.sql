-- Fix Row Level Security for All Tables
-- Run this in Supabase SQL Editor

-- Disable RLS for development/demo purposes
-- This allows all operations without authentication checks

ALTER TABLE elections DISABLE ROW LEVEL SECURITY;
ALTER TABLE voters DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE secure_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE vote_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE anonymity_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS enabled with permissive policies, use this instead:
-- 
-- ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on elections" ON elections;
-- CREATE POLICY "Allow all operations on elections" ON elections FOR ALL USING (true) WITH CHECK (true);
-- 
-- ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on voters" ON voters;
-- CREATE POLICY "Allow all operations on voters" ON voters FOR ALL USING (true) WITH CHECK (true);
-- 
-- ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on votes" ON votes;
-- CREATE POLICY "Allow all operations on votes" ON votes FOR ALL USING (true) WITH CHECK (true);
-- 
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;
-- CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
-- 
-- ALTER TABLE secure_audit_logs ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on secure_audit_logs" ON secure_audit_logs;
-- CREATE POLICY "Allow all operations on secure_audit_logs" ON secure_audit_logs FOR ALL USING (true) WITH CHECK (true);
-- 
-- ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on vote_receipts" ON vote_receipts;
-- CREATE POLICY "Allow all operations on vote_receipts" ON vote_receipts FOR ALL USING (true) WITH CHECK (true);
-- 
-- ALTER TABLE anonymity_sets ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on anonymity_sets" ON anonymity_sets;
-- CREATE POLICY "Allow all operations on anonymity_sets" ON anonymity_sets FOR ALL USING (true) WITH CHECK (true);
-- 
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations on admins" ON admins;
-- CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true) WITH CHECK (true);
