-- ===================================================================
-- DIAGNOSE VOTES TABLE ISSUE
-- Run this in Supabase SQL Editor
-- ===================================================================

-- 1. Check if votes table exists
SELECT 'VOTES TABLE CHECK:' as diagnostic;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'votes'
) as votes_table_exists;

-- 2. Show VOTES table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- 3. Count total votes
SELECT 
    'Total votes count:' as info,
    COUNT(*) as total_votes
FROM votes;

-- 4. Show all votes (with details)
SELECT 
    'All votes in database:' as info,
    id,
    election_id,
    candidate_id,
    candidate_encrypted,
    transaction_hash,
    created_at
FROM votes
ORDER BY created_at DESC
LIMIT 20;

-- 5. Check if candidate_id column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'votes' 
            AND column_name = 'candidate_id'
        ) 
        THEN '✅ candidate_id column EXISTS'
        ELSE '❌ candidate_id column MISSING - Need to add it!'
    END as candidate_id_status;

-- 6. Group votes by election
SELECT 
    'Votes by election:' as info,
    election_id,
    COUNT(*) as vote_count,
    array_agg(DISTINCT candidate_id) as candidates_voted
FROM votes
GROUP BY election_id;

-- ===================================================================
-- WHAT TO LOOK FOR:
-- ===================================================================
-- If total_votes = 0 → Votes not being saved to database
-- If candidate_id = NULL → Column exists but not populated
-- If candidate_id column MISSING → Run FIX_VOTES_TABLE.sql
-- If votes exist but admin can't see → Check RLS policies
