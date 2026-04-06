-- Quick fix: Add phone numbers to existing voters
-- This adds sample phone numbers to voters who have email but no phone

-- Update voters with email to have a phone number
-- Replace with actual phone numbers for production!

UPDATE voters 
SET phone = '+919876543210'
WHERE email = 'moinjahid31@gmail.com' AND phone IS NULL;

-- For other voters, add dummy phones (replace with real ones later)
UPDATE voters 
SET phone = '+9198765432' || LPAD(id::TEXT, 2, '0')
WHERE phone IS NULL AND email IS NOT NULL;

-- Verification
SELECT voter_id, 
       LEFT(aadhaar_encrypted, 20) as aadhaar_preview,
       phone, 
       email,
       state
FROM voters
ORDER BY created_at DESC
LIMIT 10;
