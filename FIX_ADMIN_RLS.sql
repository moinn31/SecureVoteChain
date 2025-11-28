-- FIX ADMIN TABLE RLS (Row Level Security)
-- Run this SQL in Supabase to allow the app to read admins table

-- Disable RLS on admins table (or create proper policy)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, create a policy that allows all reads:
-- First, enable RLS
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Then create a policy to allow reads
-- CREATE POLICY "Allow all to read admins" ON admins
--     FOR SELECT
--     USING (true);

-- Verify you can read admins
SELECT COUNT(*) as total_admins FROM admins;
SELECT username, state, role, is_active FROM admins LIMIT 5;
