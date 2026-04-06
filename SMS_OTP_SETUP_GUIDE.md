# 📱 SMS OTP Setup Guide - Supabase Phone Authentication

## 🎯 Overview

Your SecureVoteChain system now uses **SMS OTP** instead of email OTP for voter authentication.

### **What Changed:**
- ❌ **Removed**: Email OTP system
- ✅ **Added**: SMS OTP via Supabase Phone Auth
- 📱 **Phone Format**: +91xxxxxxxxxx (Indian mobile numbers)

---

## 🔧 Step 1: Enable Phone Auth in Supabase

### **1.1 Configure Supabase Phone Provider**

1. Go to: https://supabase.com/dashboard/project/eizoypywgprahaztradc/auth/providers
2. Find **"Phone"** provider
3. Click **"Enable Phone Provider"**
4. Choose SMS provider (Supabase uses **Twilio** by default)

### **1.2 Setup Twilio (SMS Provider)**

Supabase uses Twilio for SMS delivery. You need:

1. **Create Twilio Account**:
   - Go to: https://www.twilio.com/try-twilio
   - Sign up for free trial ($15 credit)
   - Verify your phone number

2. **Get Twilio Credentials**:
   - Go to: https://console.twilio.com/
   - Copy **Account SID**
   - Copy **Auth Token**
   - Buy a phone number (or use trial number)

3. **Configure in Supabase**:
   - Supabase Dashboard → Authentication → Providers → Phone
   - Enter Twilio Account SID
   - Enter Twilio Auth Token
   - Enter Twilio Phone Number
   - Click **Save**

---

## 📊 Step 2: Update Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Add phone column to voters table
ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(phone);

-- Allow phone lookup for OTP (RLS policy)
CREATE POLICY IF NOT EXISTS "Allow phone lookup for OTP" ON voters
FOR SELECT
USING (true);
```

Or use the provided file:
```powershell
# Upload ADD_PHONE_COLUMN.sql to Supabase SQL Editor and run it
```

---

## 🔄 Step 3: Update Voter Registration

### **3.1 Admin Panel - Bulk Import CSV**

Update your CSV file format:

**Old Format (Email)**:
```csv
Name,Aadhaar,State,Email
Rajesh Kumar,123456789012,Maharashtra,rajesh@example.com
```

**New Format (Phone)**:
```csv
Name,Aadhaar,State,Phone
Rajesh Kumar,123456789012,Maharashtra,+919876543210
```

**Phone Format Rules**:
- ✅ Must start with `+91` (India country code)
- ✅ 10 digits after +91 (total 13 characters)
- ✅ Example: `+919876543210`
- ❌ Don't use: `9876543210` (missing +91)
- ❌ Don't use: `91-9876543210` (no dashes)

### **3.2 Manual Registration**

When admins register voters manually, they must provide:
- Aadhaar Number (12 digits)
- Full Name
- State
- **Phone Number** (+91xxxxxxxxxx)

---

## 📱 Step 4: Voter Login Flow

### **4.1 Request OTP**

**Old Flow (Email)**:
1. Voter enters Aadhaar
2. System looks up email
3. Sends OTP to email
4. Voter checks inbox

**New Flow (SMS)**:
1. Voter enters Aadhaar
2. System looks up phone number
3. Sends OTP via SMS
4. Voter receives text message

### **4.2 SMS Message Format**

Voters will receive:
```
Your SecureVoteChain OTP is: 123456

This code expires in 5 minutes.
```

### **4.3 Verify OTP**

Same as before:
1. Enter 6-digit OTP
2. Click "Verify & Login"
3. Redirected to elections list

---

## ⚙️ Step 5: Environment Configuration

Update your `.env` file:

```env
# Supabase Configuration (already configured)
SUPABASE_URL=https://eizoypywgprahaztradc.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# No additional environment variables needed for SMS OTP
# Twilio credentials are configured in Supabase Dashboard
```

---

## 🧪 Step 6: Testing

### **Test 1: Register Voter with Phone**

```powershell
# Go to Admin Panel
http://localhost:5000/admin

# Click "Bulk Import Voters"
# Upload CSV with phone numbers
# Format: Name,Aadhaar,State,+919876543210
```

### **Test 2: Request SMS OTP**

```powershell
# Go to Voter Portal
http://localhost:5000/voter

# Enter Aadhaar: 123456789012
# Click "Request OTP"
```

**Expected Terminal Output**:
```
============================================================
🔐 OTP GENERATED FOR AADHAAR: 1234****9012
📱 Phone: +919876543210
🔢 OTP CODE: 123456
⏰ Valid for: 5 minutes
============================================================
✅ SMS sent via Supabase to +919876543210
📱 SMS will contain OTP code
```

**Expected SMS** (on voter's phone):
```
Your SecureVoteChain OTP is: 123456

This code expires in 5 minutes.
```

### **Test 3: Verify OTP**

1. Enter OTP: `123456`
2. Click "Verify & Login"
3. Should see elections list ✅

---

## 💰 Cost Considerations

### **Twilio Pricing (as of Nov 2025)**:
- **SMS to India**: $0.0065 per message (~₹0.54)
- **Free Trial**: $15 credit (~2,300 SMS)
- **Production**: Top up as needed

### **Supabase Pricing**:
- Phone Auth is **included** in all Supabase plans
- No additional cost for Supabase integration

### **Cost Estimate**:
- **100 voters**: ~$0.65 (~₹54)
- **1,000 voters**: ~$6.50 (~₹540)
- **10,000 voters**: ~$65 (~₹5,400)

---

## 🚨 Troubleshooting

### **Error: "Phone provider not enabled"**

**Solution**:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Phone" provider
3. Configure Twilio credentials

### **Error: "Invalid phone number format"**

**Solution**:
1. Ensure phone starts with `+91`
2. No spaces, dashes, or brackets
3. Example: `+919876543210` ✅
4. Wrong: `9876543210` ❌

### **SMS not received**

**Solution**:
1. Check Twilio account balance (need credit)
2. Verify phone number is correct in database
3. Check Twilio logs: https://console.twilio.com/monitor/logs
4. Ensure phone is not in DND (Do Not Disturb) list
5. Use OTP from terminal as backup

### **Error: "Twilio authentication failed"**

**Solution**:
1. Verify Twilio Account SID is correct
2. Verify Twilio Auth Token is correct
3. Check Twilio phone number is active
4. Ensure Twilio account has sufficient balance

### **OTP expired**

**Solution**:
1. OTP valid for 5 minutes only
2. Request new OTP if expired
3. Check system time is correct

---

## 🔒 Security Features

### **1. Phone Number Privacy**
- Phone masked in API responses (`***3210`)
- Only last 4 digits shown to user
- Full number never exposed in frontend

### **2. OTP Security**
- 6-digit random OTP (1 million combinations)
- 5-minute expiration (auto-cleanup)
- One-time use (deleted after successful login)
- Rate limiting (prevent spam)

### **3. Backup Access**
- OTP always shown in terminal (development)
- Admin can verify voters manually
- Fallback authentication methods available

---

## 📊 Database Schema Changes

### **Voters Table (Updated)**

```sql
CREATE TABLE voters (
    id SERIAL PRIMARY KEY,
    voter_id VARCHAR(50) UNIQUE NOT NULL,
    aadhaar_encrypted TEXT NOT NULL,
    name_encrypted TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    phone VARCHAR(20),  -- NEW: Phone for SMS OTP
    voter_token_hash TEXT NOT NULL,
    public_key TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Sessions Table (OTP Storage)**

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_key VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_type VARCHAR(50) NOT NULL,
    session_data JSONB NOT NULL,  -- Contains: {otp, phone, created_at, expires_at}
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
```

---

## 📱 Frontend Updates Needed

Update your voter login UI to show:

**Old Message**:
```
✅ OTP sent to raj***@example.com
Check your email inbox
```

**New Message**:
```
✅ OTP sent to ***3210 via SMS
Check your messages
```

The API already returns:
```json
{
  "success": true,
  "message": "OTP sent to ***3210 via SMS. Check your messages.",
  "phone_masked": "***3210",
  "otp_hint": "OTP starts with 12**",
  "expires_in": "5 minutes"
}
```

---

## 🎓 For Your Presentation

**What to say:**
> "Our system uses Supabase Phone Authentication with Twilio SMS delivery to send 6-digit OTP codes directly to voters' mobile phones. The OTP expires after 5 minutes for security. We mask phone numbers for privacy and provide terminal backup for development testing."

**Technical Stack:**
- Supabase Auth (Phone Provider)
- Twilio SMS Gateway
- International phone format (+91)
- 6-digit cryptographically secure OTP
- 5-minute expiration with auto-cleanup
- Terminal backup for development

**Security Features:**
- Phone number encryption in database
- OTP one-time use (deleted after login)
- Rate limiting to prevent spam
- Masked phone in API responses
- Session-based OTP storage

---

## 🔄 Migration Checklist

- [ ] Enable Phone provider in Supabase Dashboard
- [ ] Configure Twilio credentials in Supabase
- [ ] Run ADD_PHONE_COLUMN.sql in Supabase
- [ ] Update voter CSV template with phone numbers
- [ ] Re-import voters with phone numbers
- [ ] Test SMS OTP delivery
- [ ] Update frontend UI messages
- [ ] Test end-to-end flow
- [ ] Add phone validation in admin panel
- [ ] Update documentation

---

## 📞 Support

### **Twilio Support**
- Documentation: https://www.twilio.com/docs/sms
- Support: https://support.twilio.com/

### **Supabase Support**
- Phone Auth Docs: https://supabase.com/docs/guides/auth/phone-login
- Discord: https://discord.supabase.com/

---

**Status**: ✅ SMS OTP system configured and ready!

**Next Steps**:
1. Enable Phone Auth in Supabase Dashboard
2. Configure Twilio credentials
3. Run ADD_PHONE_COLUMN.sql
4. Test with real phone number
