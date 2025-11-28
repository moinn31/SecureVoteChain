-- ===================================================================
-- ADD EMAIL COLUMN TO VOTERS TABLE
-- Run this in Supabase SQL Editor
-- ===================================================================

-- Add email column to voters table
ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email);

-- Add unique constraint to prevent duplicate emails
ALTER TABLE voters
ADD CONSTRAINT unique_voter_email UNIQUE (email);

-- Verify the change
SELECT 
    'Voters table structure updated' as info,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'voters'
ORDER BY ordinal_position;

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Email column added to voters table!';
    RAISE NOTICE '✅ Voters can now receive OTP via email';
    RAISE NOTICE '🔄 Update your application code to include email in registration';
END $$;
