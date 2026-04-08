-- Run this in Supabase SQL editor to add required columns for realistic_voter_data.csv

ALTER TABLE voters
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS booth_number INTEGER,
ADD COLUMN IF NOT EXISTS ward_number INTEGER,
ADD COLUMN IF NOT EXISTS election_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS vote_status VARCHAR(50);