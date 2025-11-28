-- ===================================================================
-- QUICK DIAGNOSTIC - Check if vote tracking fix is needed
-- Run this in Supabase SQL Editor to diagnose the issue
-- ===================================================================

-- 1. Check if votes table has candidate_id column
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'votes' 
        AND column_name = 'candidate_id'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE '✅ votes.candidate_id column EXISTS';
    ELSE
        RAISE WARNING '❌ votes.candidate_id column MISSING - Run FIX_VOTES_TABLE.sql';
    END IF;
END $$;

-- 2. Check if vote_tracking table exists
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'vote_tracking'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ vote_tracking table EXISTS';
    ELSE
        RAISE WARNING '❌ vote_tracking table MISSING - Run FIX_VOTES_TABLE.sql';
    END IF;
END $$;

-- 3. Show current votes table structure
SELECT 
    '📋 Current VOTES table columns:' as info,
    column_name, 
    data_type,
    CASE WHEN is_nullable = 'YES' THEN '✓ NULL' ELSE '✗ NOT NULL' END as nullable
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- 4. Count existing votes
SELECT 
    '📊 Total votes in database:' as info,
    COUNT(*) as total_votes
FROM votes;

-- 5. Show votes by election
SELECT 
    '🗳️ Votes per election:' as info,
    election_id,
    COUNT(*) as vote_count
FROM votes
GROUP BY election_id
ORDER BY vote_count DESC;

-- ===================================================================
-- RESULT INTERPRETATION
-- ===================================================================

-- If you see:
-- ❌ votes.candidate_id column MISSING → You MUST run FIX_VOTES_TABLE.sql
-- ❌ vote_tracking table MISSING → You MUST run FIX_VOTES_TABLE.sql
-- ✅ Both exist → Your database is ready!
