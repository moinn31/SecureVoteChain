
-- =====================================================
-- COMPLETE SECUREVOTECHAIN SCHEMA FOR SUPABASE
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- 1. ELECTIONS TABLE
CREATE TABLE IF NOT EXISTS elections (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    state VARCHAR(100),
    candidates JSONB NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure state column exists in case the table was created previously without it
ALTER TABLE elections ADD COLUMN IF NOT EXISTS state VARCHAR(100);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_elections_state ON elections(state);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_end_time ON elections(end_time);

-- 2. VOTERS TABLE
CREATE TABLE IF NOT EXISTS voters (
    id SERIAL PRIMARY KEY,
    voter_id VARCHAR(255) UNIQUE NOT NULL,
    aadhaar_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    voter_token VARCHAR(500) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure columns exist in case the table was created previously without them
ALTER TABLE voters ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Index for faster voter lookups
CREATE INDEX IF NOT EXISTS idx_voters_voter_id ON voters(voter_id);
CREATE INDEX IF NOT EXISTS idx_voters_aadhaar ON voters(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_voters_state ON voters(state);
CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email);
CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(phone);

-- 3. VOTES TABLE
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    election_id VARCHAR(255) NOT NULL,
    candidate_id VARCHAR(255) NOT NULL,
    voter_token_hash VARCHAR(500) NOT NULL,
    transaction_hash VARCHAR(500) UNIQUE NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

-- Index for faster vote counting
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_transaction_hash ON votes(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_votes_voter_token ON votes(voter_token_hash, election_id);

-- 4. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

-- Index for session lookup
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Disable RLS for Sessions to match your screenshot 
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    state VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- 6. BLOCKCHAIN TABLE
CREATE TABLE IF NOT EXISTS blockchain (
    id SERIAL PRIMARY KEY,
    chain_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
