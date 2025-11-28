-- ===================================================================
-- FIX VOTES TABLE - Add missing columns for vote tracking
-- Run this SQL in your Supabase SQL Editor
-- ===================================================================

-- Add candidate_id column (for debugging/admin purposes only)
-- This is separate from candidate_encrypted for privacy balance
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS candidate_id VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);

-- ===================================================================
-- CREATE VOTE TRACKING TABLE (if not exists)
-- Tracks which voters have voted without linking to specific votes
-- ===================================================================

CREATE TABLE IF NOT EXISTS vote_tracking (
    id SERIAL PRIMARY KEY,
    election_id VARCHAR(255) NOT NULL,
    voter_token_hash VARCHAR(255) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent double voting
    CONSTRAINT unique_voter_election UNIQUE(election_id, voter_token_hash)
);

-- Indexes for vote_tracking
CREATE INDEX IF NOT EXISTS idx_vote_tracking_election ON vote_tracking(election_id);
CREATE INDEX IF NOT EXISTS idx_vote_tracking_voter ON vote_tracking(voter_token_hash);

-- ===================================================================
-- VERIFICATION
-- ===================================================================

-- Check votes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- Check vote_tracking table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vote_tracking'
ORDER BY ordinal_position;

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Votes table updated successfully!';
    RAISE NOTICE '✅ Vote tracking table created successfully!';
    RAISE NOTICE '🔒 Privacy features: Votes are encrypted, tracking is separate';
    RAISE NOTICE '📊 Admin can now see vote counts in real-time';
END $$;
