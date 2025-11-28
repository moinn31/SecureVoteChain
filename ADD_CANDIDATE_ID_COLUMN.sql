-- ===================================================================
-- COMPLETE FIX FOR VOTES TABLE
-- This addresses the column mismatch issue
-- ===================================================================

-- Step 1: Check current structure
SELECT 'Current votes table structure:' as step;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- Step 2: Add missing candidate_id column if not exists
DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'votes' 
        AND column_name = 'candidate_id'
    ) THEN
        -- Add the column
        ALTER TABLE votes ADD COLUMN candidate_id VARCHAR(255);
        RAISE NOTICE '✅ Added candidate_id column';
    ELSE
        RAISE NOTICE '✅ candidate_id column already exists';
    END IF;
END $$;

-- Step 3: Create index on candidate_id
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);

-- Step 4: Verify the fix
SELECT 'Verification - votes table now has:' as result;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- Step 5: Test query that admin dashboard uses
SELECT 
    'Test: Get election results (what admin dashboard queries):' as test,
    election_id,
    candidate_id,
    candidate_encrypted,
    COUNT(*) as vote_count
FROM votes
WHERE election_id = (SELECT election_id FROM votes LIMIT 1)
GROUP BY election_id, candidate_id, candidate_encrypted;

-- ===================================================================
-- SUCCESS CONFIRMATION
-- ===================================================================

DO $$
DECLARE
    vote_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO vote_count FROM votes;
    RAISE NOTICE '======================================';
    RAISE NOTICE '✅ VOTES TABLE FIXED!';
    RAISE NOTICE 'Total votes in database: %', vote_count;
    RAISE NOTICE '✅ candidate_id column available';
    RAISE NOTICE '✅ Admin dashboard should now show results';
    RAISE NOTICE '======================================';
END $$;
