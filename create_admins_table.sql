-- Create admins table for database-based authentication
-- Run this SQL in your Supabase SQL Editor

-- Drop table if exists
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(64) NOT NULL,
    email VARCHAR(255) UNIQUE,
    state VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_state ON admins(state);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(is_active);

-- Insert all default admin users
-- Default password for all admins: admin123
-- SHA-256 hash of admin123: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

INSERT INTO admins (username, password_hash, email, state, role) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin@securevotechain.com', 'All States', 'super_admin'),
('admin_andhra_pradesh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.ap@securevotechain.com', 'Andhra Pradesh', 'state_admin'),
('admin_arunachal_pradesh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.ar@securevotechain.com', 'Arunachal Pradesh', 'state_admin'),
('admin_assam', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.as@securevotechain.com', 'Assam', 'state_admin'),
('admin_bihar', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.br@securevotechain.com', 'Bihar', 'state_admin'),
('admin_chhattisgarh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.cg@securevotechain.com', 'Chhattisgarh', 'state_admin'),
('admin_goa', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.ga@securevotechain.com', 'Goa', 'state_admin'),
('admin_gujarat', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.gj@securevotechain.com', 'Gujarat', 'state_admin'),
('admin_haryana', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.hr@securevotechain.com', 'Haryana', 'state_admin'),
('admin_himachal_pradesh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.hp@securevotechain.com', 'Himachal Pradesh', 'state_admin'),
('admin_jharkhand', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.jh@securevotechain.com', 'Jharkhand', 'state_admin'),
('admin_karnataka', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.ka@securevotechain.com', 'Karnataka', 'state_admin'),
('admin_kerala', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.kl@securevotechain.com', 'Kerala', 'state_admin'),
('admin_madhya_pradesh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.mp@securevotechain.com', 'Madhya Pradesh', 'state_admin'),
('admin_maharashtra', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.mh@securevotechain.com', 'Maharashtra', 'state_admin'),
('admin_manipur', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.mn@securevotechain.com', 'Manipur', 'state_admin'),
('admin_meghalaya', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.ml@securevotechain.com', 'Meghalaya', 'state_admin'),
('admin_mizoram', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.mz@securevotechain.com', 'Mizoram', 'state_admin'),
('admin_nagaland', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.nl@securevotechain.com', 'Nagaland', 'state_admin'),
('admin_odisha', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.or@securevotechain.com', 'Odisha', 'state_admin'),
('admin_punjab', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.pb@securevotechain.com', 'Punjab', 'state_admin'),
('admin_rajasthan', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.rj@securevotechain.com', 'Rajasthan', 'state_admin'),
('admin_sikkim', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.sk@securevotechain.com', 'Sikkim', 'state_admin'),
('admin_tamil_nadu', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.tn@securevotechain.com', 'Tamil Nadu', 'state_admin'),
('admin_telangana', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.tg@securevotechain.com', 'Telangana', 'state_admin'),
('admin_tripura', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.tr@securevotechain.com', 'Tripura', 'state_admin'),
('admin_uttar_pradesh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.up@securevotechain.com', 'Uttar Pradesh', 'state_admin'),
('admin_uttarakhand', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.uk@securevotechain.com', 'Uttarakhand', 'state_admin'),
('admin_west_bengal', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.wb@securevotechain.com', 'West Bengal', 'state_admin'),
('admin_andaman_nicobar', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.an@securevotechain.com', 'Andaman and Nicobar Islands', 'state_admin'),
('admin_chandigarh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.ch@securevotechain.com', 'Chandigarh', 'state_admin'),
('admin_dadra_nagar_haveli', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.dn@securevotechain.com', 'Dadra and Nagar Haveli and Daman and Diu', 'state_admin'),
('admin_delhi', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.dl@securevotechain.com', 'Delhi', 'state_admin'),
('admin_jammu_kashmir', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.jk@securevotechain.com', 'Jammu and Kashmir', 'state_admin'),
('admin_ladakh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.la@securevotechain.com', 'Ladakh', 'state_admin'),
('admin_lakshadweep', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.ld@securevotechain.com', 'Lakshadweep', 'state_admin'),
('admin_puducherry', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin.py@securevotechain.com', 'Puducherry', 'state_admin');

-- Disable Row Level Security so the app can read and seed admin accounts
-- If you want RLS later, add explicit policies after the table is populated.
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Verify the data
SELECT username, email, state, role, is_active, created_at FROM admins ORDER BY created_at;

COMMENT ON TABLE admins IS 'Administrator accounts with role-based access control';
COMMENT ON COLUMN admins.password_hash IS 'SHA-256 hash of admin password';
COMMENT ON COLUMN admins.role IS 'super_admin: access all states, state_admin: access specific state';
