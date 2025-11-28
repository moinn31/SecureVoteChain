-- ===================================================================
-- QUICK FIX: Just add the candidate_id column
-- Run this FIRST if votes aren't showing in admin dashboard
-- ===================================================================

ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS candidate_id VARCHAR(255);

-- Verify it worked
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'votes' AND column_name = 'candidate_id'
        )
        THEN '✅ SUCCESS! candidate_id column added to votes table'
        ELSE '❌ FAILED - Try running again'
    END as result;

-- Show current vote count
SELECT 
    '📊 Current votes in database:' as info,
    COUNT(*) as total_votes
FROM votes;

-- If votes exist, show them
SELECT * FROM votes ORDER BY created_at DESC LIMIT 5;
