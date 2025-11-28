-- Fix Row Level Security for Sessions Table
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS for sessions table (simpler for development)
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Option 2: Or create a permissive policy (if you want to keep RLS enabled)
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
