# 🔐 Email-Based OTP Authentication Setup Guide

## Overview
The voter authentication system has been completely overhauled to use **email-based OTP** (One-Time Password) instead of mock Aadhaar authentication. This provides secure, production-ready authentication using Supabase Auth.

---

## 🎯 What Changed

### **Old System (Mock Authentication)**
- Used hardcoded demo Aadhaar numbers
- Fixed OTP: 123456
- No real email integration
- Not production-ready

### **New System (Email OTP)**
- Real email-based OTP via Supabase Auth
- Automatic OTP generation and delivery
- Secure 6-digit codes with expiration
- Production-ready authentication

---

## 📋 Prerequisites

Before proceeding, ensure you have:

1. **Supabase Project** with admin access
2. **Database access** to run SQL commands
3. **SMTP configured** in Supabase (for email sending)
4. **Existing voters table** (either `voters` or `secure_voters`)

---

## 🚀 Setup Instructions

### **Step 1: Add Email Column to Database**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the following SQL script:

```sql
-- Add email column to voters table
-- Run this in Supabase SQL Editor

-- Add email column (varchar 255, unique)
ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email);

-- Add unique constraint to prevent duplicate emails
ALTER TABLE voters 
ADD CONSTRAINT unique_voter_email UNIQUE (email);

-- Optional: Update existing voters with placeholder emails
-- UPDATE voters SET email = CONCAT('voter', voter_id, '@example.com') WHERE email IS NULL;

COMMENT ON COLUMN voters.email IS 'Voter email address for OTP authentication';
```

**Important Notes:**
- This script is safe to run multiple times (uses `IF NOT EXISTS`)
- Replace `voters` with `secure_voters` if that's your table name
- The unique constraint ensures no duplicate emails
- Placeholder email update is optional and commented out

### **Step 2: Verify Email Configuration in Supabase**

1. Go to **Authentication** → **Email Templates** in Supabase
2. Ensure **Magic Link** template is enabled
3. Check **SMTP Settings** are configured (or use Supabase default)
4. Test email sending with a test account

### **Step 3: Update Voter Records (CSV Import)**

The CSV import now requires **4 columns**:

```csv
name,aadhaar,state,email
Rajesh Kumar,123456789012,Maharashtra,rajesh.kumar@example.com
Priya Sharma,234567890123,Delhi,priya.sharma@example.com
Amit Patel,345678901234,Gujarat,amit.patel@example.com
```

**Required Columns:**
- `name` - Full name of voter
- `aadhaar` - 12-digit Aadhaar number
- `state` - Valid Indian state/UT
- `email` - Valid email address

**Import Process:**
1. Go to Admin Dashboard
2. Click "Import Voters"
3. Upload CSV/Excel file with all 4 columns
4. System will validate:
   - Aadhaar: 12 digits
   - Email: Valid format with @ and domain
   - State: Must match Indian States list
   - No duplicates (Aadhaar or email)

---

## 🔄 New Authentication Flow

### **For Voters (Login Process):**

1. **Enter Aadhaar Number** (12 digits)
   - System looks up voter by Aadhaar
   - Retrieves associated email

2. **Request OTP**
   - Click "Request OTP" button
   - System sends 6-digit OTP to voter's email via Supabase Auth
   - Displays masked email: `raj***@gmail.com`

3. **Enter OTP**
   - Check email inbox (and spam folder)
   - Enter 6-digit code received
   - Click "Verify & Login"

4. **Success!**
   - Session token created
   - Redirected to voting interface
   - Can now vote in active elections

### **Technical Flow:**

```
User Input (Aadhaar)
    ↓
GET email from database (get_email_by_aadhaar)
    ↓
Supabase Auth → sign_in_with_otp({ email })
    ↓
Email sent to voter
    ↓
User enters OTP
    ↓
Supabase Auth → verify_otp({ email, token })
    ↓
Create session token
    ↓
Return voter credentials & session
```

---

## 🧪 Testing the System

### **Test 1: Import Voters**

1. Create test CSV file:
```csv
name,aadhaar,state,email
Test Voter 1,111111111111,Maharashtra,test1@yourdomain.com
Test Voter 2,222222222222,Delhi,test2@yourdomain.com
```

2. Go to Admin Dashboard → Import Voters
3. Upload the CSV file
4. Verify: "Successfully imported 2 voters"

### **Test 2: Login Flow**

1. Go to Voter Portal
2. Enter Aadhaar: `111111111111`
3. Click "Request OTP"
4. Check `test1@yourdomain.com` inbox
5. Enter the 6-digit OTP received
6. Click "Verify & Login"
7. Should see: "Login successful!"

### **Test 3: Invalid Cases**

- **Invalid Aadhaar**: Enter 11 digits → Error: "Invalid Aadhaar number"
- **Unregistered Aadhaar**: Enter random 12 digits → Error: "Aadhaar number not registered"
- **Wrong OTP**: Enter incorrect code → Error: "Invalid OTP"
- **Expired OTP**: Wait 10 minutes, try old OTP → Error: "OTP verification failed"

---

## 🔧 Troubleshooting

### **Issue: "Error sending OTP"**

**Cause:** Supabase Auth not configured or email service down

**Solution:**
1. Check Supabase Dashboard → Authentication → Settings
2. Verify SMTP settings or use Supabase email service
3. Test email delivery with a test account
4. Check Supabase logs for errors

### **Issue: "Aadhaar number not registered"**

**Cause:** Voter not imported or email column missing

**Solution:**
1. Run the SQL script from Step 1
2. Import voters with CSV (must include email column)
3. Check database: `SELECT * FROM voters WHERE aadhaar_encrypted LIKE '%';`

### **Issue: "Invalid OTP"**

**Cause:** Wrong code, expired OTP, or email mismatch

**Solution:**
1. Request new OTP (old ones expire after 10 minutes)
2. Check email spam folder
3. Verify email address in database matches
4. Try logging in again from scratch

### **Issue: CSV Import Fails**

**Cause:** Missing columns or invalid data

**Solution:**
1. Ensure CSV has ALL 4 columns: name, aadhaar, state, email
2. Check Aadhaar is exactly 12 digits
3. Validate email format (must have @ and domain)
4. Use valid Indian state names (see INDIAN_STATES list)

---

## 📊 Database Schema Changes

### **Before:**
```sql
CREATE TABLE voters (
    voter_id VARCHAR(50) PRIMARY KEY,
    aadhaar_encrypted TEXT,
    name_encrypted TEXT,
    state VARCHAR(100),
    voter_token_hash TEXT,
    public_key TEXT
);
```

### **After:**
```sql
CREATE TABLE voters (
    voter_id VARCHAR(50) PRIMARY KEY,
    aadhaar_encrypted TEXT,
    name_encrypted TEXT,
    state VARCHAR(100),
    voter_token_hash TEXT,
    public_key TEXT,
    email VARCHAR(255) UNIQUE  -- ← NEW COLUMN
);

CREATE INDEX idx_voters_email ON voters(email);
```

---

## 🔒 Security Features

### **Email Privacy**
- Email shown as masked: `raj***@gmail.com`
- Full email never exposed in API responses
- Only admin can see full emails in database

### **OTP Security**
- 6-digit random code
- Expires after 10 minutes
- Single-use only (cannot reuse)
- Rate-limited by Supabase Auth

### **Aadhaar Protection**
- Aadhaar stored encrypted (`aadhaar_encrypted`)
- Never transmitted in plain text
- Slow lookup by design (security feature)

### **Session Management**
- Secure session tokens (64 hex chars)
- Stored server-side with expiration
- Auto-logout on inactivity

---

## 📝 API Endpoints Updated

### **POST /api/voter/request-otp**
**Request:**
```json
{
  "aadhaar_number": "123456789012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to raj***@gmail.com",
  "email_masked": "raj***@gmail.com"
}
```

### **POST /api/voter/verify-otp** (NEW)
**Request:**
```json
{
  "aadhaar_number": "123456789012",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "voter_id": "V1234567890AB",
  "voter_token": "abc123...",
  "name": "Rajesh Kumar",
  "state": "Maharashtra",
  "session_token": "def456...",
  "message": "Login successful!"
}
```

### **POST /api/admin/import-voters**
**Now Requires:**
- CSV with 4 columns: `name`, `aadhaar`, `state`, `email`
- Email validation (format check)
- Duplicate email prevention

---

## 🎓 For Developers

### **Backend Changes:**

1. **secure_supabase_db.py**
   - Added `get_email_by_aadhaar()` method
   - Updated `register_voter_secure()` to accept email
   - Modified `get_voter_by_aadhaar()` to include email

2. **main.py**
   - Updated `/api/voter/request-otp` for Supabase Auth
   - Created `/api/voter/verify-otp` for OTP verification
   - Enhanced `/api/admin/import-voters` with email validation

3. **models.py**
   - Added `email: str` to `VoterRegistration` model
   - Optional `name` field for registration

### **Frontend Changes:**

1. **voter.js**
   - Updated `requestOtp()` to show masked email
   - Modified `handleRegister()` to call verify-otp
   - Removed hardcoded demo OTP display

---

## ✅ Checklist

Before going live, verify:

- [ ] SQL script executed successfully
- [ ] Email column exists in voters table
- [ ] Supabase Auth email configured
- [ ] Test email delivery working
- [ ] CSV import with email column works
- [ ] Login flow with real OTP tested
- [ ] Invalid cases handled correctly
- [ ] Admin dashboard shows voters with emails
- [ ] Security: No plaintext emails exposed
- [ ] Documentation updated for users

---

## 🆘 Support

If you encounter issues:

1. **Check Supabase Dashboard Logs**
   - Go to Logs → Functions → Filter by "auth"
   - Look for email delivery failures

2. **Verify Database**
   ```sql
   SELECT voter_id, email, state FROM voters LIMIT 5;
   ```

3. **Test OTP Manually**
   - Use Supabase Auth → Users → Add Test User
   - Try Magic Link login
   - Verify email delivery

4. **Check Browser Console**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for API failures

---

## 📄 Summary

You now have a **production-ready email-based OTP authentication system**:

✅ Secure email OTP via Supabase Auth  
✅ Automatic email delivery  
✅ No hardcoded credentials  
✅ Complete validation (Aadhaar, email, state)  
✅ Duplicate prevention  
✅ Session management  
✅ Privacy-preserving (masked emails)  

**Next Steps:**
1. Run the SQL script (Step 1)
2. Import voters with email column
3. Test the login flow
4. Deploy to production!

---

**Created:** November 2024  
**Version:** 1.0  
**System:** SecureVoteChain - Email OTP Authentication
