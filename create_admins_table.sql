-- Create admins table for database-based authentication
-- Run this SQL in your Supabase SQL Editor

-- Drop table if exists
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(64) NOT NULL,  -- SHA-256 hash
    email VARCHAR(255) UNIQUE,
    state VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- 'super_admin' or 'state_admin'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create index on username for faster lookups
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_state ON admins(state);

-- Insert default admin users
-- Note: Passwords are hashed with SHA-256
-- admin/admin123 -> SHA-256 hash
-- admin_maharashtra/mh123 -> SHA-256 hash
-- etc.

INSERT INTO admins (username, password_hash, email, state, role) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin@securevotechain.com', 'All States', 'super_admin'),
('admin_maharashtra', '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8', 'admin.mh@securevotechain.com', 'Maharashtra', 'state_admin'),
('admin_delhi', '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8', 'admin.dl@securevotechain.com', 'Delhi', 'state_admin'),
('admin_karnataka', '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8', 'admin.ka@securevotechain.com', 'Karnataka', 'state_admin'),
('admin_tamilnadu', '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8', 'admin.tn@securevotechain.com', 'Tamil Nadu', 'state_admin');

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (optional - uncomment if needed)
-- CREATE POLICY "Allow authenticated admin access" ON admins
--     FOR ALL
--     USING (true);

-- Verify the data
SELECT username, email, state, role, is_active, created_at FROM admins ORDER BY created_at;

COMMENT ON TABLE admins IS 'Administrator accounts with role-based access control';
COMMENT ON COLUMN admins.password_hash IS 'SHA-256 hash of admin password';
COMMENT ON COLUMN admins.role IS 'super_admin: access all states, state_admin: access specific state';
