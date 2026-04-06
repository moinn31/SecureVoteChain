-- Add mobile/phone column to voters table (if not already added)
-- This is in addition to the phone column used for SMS OTP

-- Add phone column if it doesn't exist (from previous migration)
ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add additional contact number column (optional - for emergency contact)
ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(phone);
CREATE INDEX IF NOT EXISTS idx_voters_contact_phone ON voters(contact_phone);

-- Add comments
COMMENT ON COLUMN voters.phone IS 'Primary phone number for SMS OTP authentication (+91xxxxxxxxxx)';
COMMENT ON COLUMN voters.contact_phone IS 'Secondary/emergency contact number (optional)';

-- Verification
SELECT 
    COUNT(*) as total_voters,
    COUNT(phone) as voters_with_phone,
    COUNT(contact_phone) as voters_with_contact_phone
FROM voters;

-- Sample data view
SELECT 
    voter_id,
    phone,
    contact_phone,
    state,
    created_at
FROM voters
ORDER BY created_at DESC
LIMIT 5;
