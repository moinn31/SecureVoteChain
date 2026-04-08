
-- Run this in your Supabase SQL Editor to upgrade tables to the Secure/Encrypted schema!
-- It handles the fields your backend is complaining about.

DROP TABLE IF EXISTS voters CASCADE;
DROP TABLE IF EXISTS votes CASCADE;

-- 1. SECURE ENCRYPTED VOTERS TABLE
CREATE TABLE voters (
    id SERIAL PRIMARY KEY,
    voter_id VARCHAR(255) UNIQUE NOT NULL,
    aadhaar_encrypted TEXT NOT NULL,
    name_encrypted TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    voter_token_hash VARCHAR(255) UNIQUE NOT NULL,
    public_key TEXT,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_voters_state ON voters(state);
CREATE INDEX idx_voters_token_hash ON voters(voter_token_hash);

-- 2. SECURE ZKP VOTES TABLE
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    election_id VARCHAR(255) NOT NULL,
    candidate_encrypted TEXT NOT NULL,
    commitment VARCHAR(255) UNIQUE NOT NULL,
    proof_hash VARCHAR(255) NOT NULL,
    ring_signature JSONB,
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notify cache to update!
NOTIFY pgrst, 'reload schema';
