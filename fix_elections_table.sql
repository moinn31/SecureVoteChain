-- Add missing state column to elections table
-- Run this in Supabase SQL Editor

-- Add state column if it doesn't exist
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS state VARCHAR(100);

-- Create index on state
CREATE INDEX IF NOT EXISTS idx_elections_state ON elections(state);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'elections'
ORDER BY ordinal_position;
