-- Migration: Replace email with phone for SMS OTP
-- Date: November 29, 2025
-- Purpose: Switch from email OTP to SMS OTP using Supabase Auth

-- Step 1: Add phone column to voters table
ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Step 2: Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(phone);

-- Step 3: (Optional) Remove email column if you don't need it
-- Uncomment below if you want to completely remove email
-- ALTER TABLE voters DROP COLUMN IF EXISTS email;

-- Step 4: Update RLS policies to allow phone number lookups
-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Allow phone lookup for OTP" ON voters;
CREATE POLICY "Allow phone lookup for OTP" ON voters
FOR SELECT
USING (true);

-- Step 5: Comment on phone column
COMMENT ON COLUMN voters.phone IS 'Phone number in international format (+91xxxxxxxxxx) for SMS OTP authentication';

-- Verification queries
SELECT 'Migration complete! Phone column added.' AS status;
SELECT COUNT(*) as total_voters, 
       COUNT(phone) as voters_with_phone,
       COUNT(email) as voters_with_email
FROM voters;
