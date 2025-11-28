-- =====================================================
-- SecureVoteChain - Supabase PostgreSQL Database Schema
-- =====================================================
-- Run this script in Supabase SQL Editor to create all tables

-- 1. ELECTIONS TABLE
CREATE TABLE IF NOT EXISTS elections (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    state VARCHAR(100) NOT NULL,
    candidates JSONB NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_elections_state ON elections(state);
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_end_time ON elections(end_time);

-- 2. VOTERS TABLE
CREATE TABLE IF NOT EXISTS voters (
    id SERIAL PRIMARY KEY,
    voter_id VARCHAR(255) UNIQUE NOT NULL,
    aadhaar_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    voter_token VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster voter lookups
CREATE INDEX idx_voters_voter_id ON voters(voter_id);
CREATE INDEX idx_voters_aadhaar ON voters(aadhaar_number);
CREATE INDEX idx_voters_state ON voters(state);

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
CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX idx_votes_transaction_hash ON votes(transaction_hash);
CREATE INDEX idx_votes_voter_token ON votes(voter_token_hash, election_id);

-- 4. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

-- Index for session lookup
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

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
CREATE INDEX idx_audit_logs_username ON audit_logs(username);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- 6. BLOCKCHAIN TABLE
CREATE TABLE IF NOT EXISTS blockchain (
    id SERIAL PRIMARY KEY,
    chain_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables for security
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain ENABLE ROW LEVEL SECURITY;

-- Public read access for elections (active ones)
CREATE POLICY "Public can view active elections"
ON elections FOR SELECT
USING (status = 'active');

-- Public read access for vote statistics (anonymized)
CREATE POLICY "Public can view vote counts"
ON votes FOR SELECT
USING (true);

-- Only service role can insert/update elections
CREATE POLICY "Service role can manage elections"
ON elections FOR ALL
USING (auth.role() = 'service_role');

-- Only service role can manage voters
CREATE POLICY "Service role can manage voters"
ON voters FOR ALL
USING (auth.role() = 'service_role');

-- Only service role can insert votes
CREATE POLICY "Service role can manage votes"
ON votes FOR ALL
USING (auth.role() = 'service_role');

-- Session policies
CREATE POLICY "Service role can manage sessions"
ON sessions FOR ALL
USING (auth.role() = 'service_role');

-- Audit log policies
CREATE POLICY "Service role can manage audit logs"
ON audit_logs FOR ALL
USING (auth.role() = 'service_role');

-- Blockchain policies
CREATE POLICY "Service role can manage blockchain"
ON blockchain FOR ALL
USING (auth.role() = 'service_role');

-- =====================================================
-- FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Get election results
CREATE OR REPLACE FUNCTION get_election_results(election_id_param VARCHAR)
RETURNS TABLE (
    candidate_id VARCHAR,
    vote_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        votes.candidate_id,
        COUNT(*)::BIGINT as vote_count
    FROM votes
    WHERE votes.election_id = election_id_param
    GROUP BY votes.candidate_id
    ORDER BY vote_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Get voter turnout by state
CREATE OR REPLACE FUNCTION get_voter_turnout_by_state()
RETURNS TABLE (
    state VARCHAR,
    total_voters BIGINT,
    total_votes BIGINT,
    turnout_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.state,
        COUNT(DISTINCT v.voter_id)::BIGINT as total_voters,
        COUNT(DISTINCT vt.id)::BIGINT as total_votes,
        CASE 
            WHEN COUNT(DISTINCT v.voter_id) > 0 
            THEN ROUND((COUNT(DISTINCT vt.id)::NUMERIC / COUNT(DISTINCT v.voter_id) * 100), 2)
            ELSE 0
        END as turnout_percentage
    FROM voters v
    LEFT JOIN votes vt ON vt.voter_token_hash = v.voter_token
    GROUP BY v.state
    ORDER BY turnout_percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- Check if voter has voted in election
CREATE OR REPLACE FUNCTION has_user_voted(
    election_id_param VARCHAR,
    voter_token_param VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    vote_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM votes 
        WHERE election_id = election_id_param 
        AND voter_token_hash = voter_token_param
    ) INTO vote_exists;
    
    RETURN vote_exists;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamp on election updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_elections_updated_at
BEFORE UPDATE ON elections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample data

/*
-- Sample election
INSERT INTO elections (id, title, description, state, candidates, start_time, end_time, status)
VALUES (
    'election-test-001',
    'Maharashtra State Election 2025',
    'Test election for Maharashtra state',
    'Maharashtra',
    '[
        {"id": "c1", "name": "Candidate A", "party": "Party A", "symbol": "🌟"},
        {"id": "c2", "name": "Candidate B", "party": "Party B", "symbol": "🌺"},
        {"id": "c3", "name": "Candidate C", "party": "Party C", "symbol": "🌙"}
    ]'::jsonb,
    NOW(),
    NOW() + INTERVAL '7 days',
    'active'
);

-- Sample voter
INSERT INTO voters (voter_id, name, state, voter_token)
VALUES (
    'MH12345678',
    'Test Voter',
    'Maharashtra',
    'test-token-hash-12345'
);
*/

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Analyze tables for query optimization
ANALYZE elections;
ANALYZE voters;
ANALYZE votes;
ANALYZE sessions;
ANALYZE audit_logs;
ANALYZE blockchain;

-- =====================================================
-- COMPLETED!
-- =====================================================

SELECT 'Database schema created successfully! ✅' as status;
SELECT 'Tables created: ' || COUNT(*)::TEXT || ' tables' as info
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('elections', 'voters', 'votes', 'sessions', 'audit_logs', 'blockchain');

-- Show all tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('elections', 'voters', 'votes', 'sessions', 'audit_logs', 'blockchain')
ORDER BY table_name;
