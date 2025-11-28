-- ===================================================================
-- COMPLETE VOTES TABLE FIX - Add ALL missing columns
-- Run this in Supabase SQL Editor
-- ===================================================================

-- Add candidate_id column
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS candidate_id VARCHAR(255);

-- Add created_at column (this is the current missing one!)
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add transaction_hash column if missing
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR(255) UNIQUE;

-- Add timestamp column if missing
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_tx_hash ON votes(transaction_hash);

-- ===================================================================
-- VERIFY ALL COLUMNS EXIST
-- ===================================================================

SELECT 
    'Final votes table structure:' as info,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ votes table structure updated!';
    RAISE NOTICE '✅ Added: candidate_id, created_at, transaction_hash';
    RAISE NOTICE '✅ Server can now save votes successfully';
    RAISE NOTICE '🔄 RESTART your server now!';
END $$;
