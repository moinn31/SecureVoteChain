# 📱 Mobile Number Addition - Complete Guide

## ✅ What's Added

### **1. Voter Mobile Numbers**
- **Primary Phone**: Used for SMS OTP authentication
- **Contact Phone**: Optional secondary/emergency contact

### **2. Database Schema**
- `phone` column: Primary phone for OTP (+91xxxxxxxxxx)
- `contact_phone` column: Optional secondary contact

### **3. Candidate Contact Info**
- Already exists: `contact_phone` field in Candidate model
- Already exists: `contact_email` field
- Admins can add candidate contact info when creating elections

---

## 🔧 Setup Steps

### **Step 1: Run SQL Migration**

Execute `ADD_VOTER_MOBILE_COLUMN.sql` in Supabase SQL Editor:

```sql
-- Adds phone columns to voters table
ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE voters 
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
```

This adds both columns if they don't exist.

---

### **Step 2: Import Voters with Mobile Numbers**

Use the updated CSV template:

```csv
Name,Aadhaar,State,Phone,Contact Phone (Optional)
Rajesh Kumar,123456789012,Maharashtra,+919876543210,+919876543220
Priya Sharma,234567890123,Delhi,+919876543211,+919876543221
```

**Format Rules**:
- **Phone**: Required, format `+91xxxxxxxxxx`
- **Contact Phone**: Optional, same format
- Both used for voter contact/notifications

---

### **Step 3: Admin Panel - Bulk Import**

1. Go to Admin Panel: http://localhost:5000/admin
2. Click **"Bulk Import Voters"**
3. Upload CSV with updated format
4. System validates phone numbers automatically

---

## 📊 Data Structure

### **Voters Table (Updated)**

```sql
CREATE TABLE voters (
    id SERIAL PRIMARY KEY,
    voter_id VARCHAR(50) UNIQUE NOT NULL,
    aadhaar_encrypted TEXT NOT NULL,
    name_encrypted TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    
    -- Mobile numbers (NEW/UPDATED)
    phone VARCHAR(20),              -- Primary phone for SMS OTP
    contact_phone VARCHAR(20),      -- Secondary contact (optional)
    
    voter_token_hash TEXT NOT NULL,
    public_key TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Candidates (Already Has Mobile)**

```python
class Candidate:
    name: str
    party: str
    contact_phone: Optional[str]  # ✅ Already exists
    contact_email: Optional[str]  # ✅ Already exists
```

---

## 🎯 Use Cases

### **1. SMS OTP Authentication**
- Uses `phone` column
- Required for voter login
- Format: `+91xxxxxxxxxx`

### **2. Emergency Contact**
- Uses `contact_phone` column
- Optional additional number
- For notifications/alerts

### **3. Candidate Contact**
- Uses `contact_phone` in Candidate model
- Displayed to voters
- For voter inquiries to candidates

---

## 📝 CSV Import Examples

### **Minimal (Phone Only)**:
```csv
Name,Aadhaar,State,Phone
Rajesh Kumar,123456789012,Maharashtra,+919876543210
```

### **Complete (With Contact Phone)**:
```csv
Name,Aadhaar,State,Phone,Contact Phone (Optional)
Rajesh Kumar,123456789012,Maharashtra,+919876543210,+919876543220
```

---

## 🔒 Privacy & Security

### **Phone Number Storage**
- ✅ Stored securely in database
- ✅ Masked in API responses (`***3210`)
- ✅ Not exposed in public election data
- ✅ Used only for OTP delivery

### **Contact Phone**
- ✅ Optional field
- ✅ Separate from OTP phone
- ✅ Can be used for notifications
- ✅ Not required for login

---

## ✅ Testing

### **Test 1: Register with Phone**
1. Admin imports voter with phone: `+919876543210`
2. Voter requests OTP
3. SMS sent to `+919876543210`
4. OTP verification works ✅

### **Test 2: Contact Phone**
1. Admin imports voter with both phones
2. Check Supabase → voters table
3. Both `phone` and `contact_phone` populated ✅

### **Test 3: Candidate Contact**
1. Admin creates election
2. Add candidate with contact phone
3. Voters see candidate contact info ✅

---

## 📋 Migration Checklist

- [ ] Run `ADD_VOTER_MOBILE_COLUMN.sql` in Supabase
- [ ] Update CSV template with phone numbers
- [ ] Re-import existing voters with phone numbers
- [ ] Test SMS OTP with real phone
- [ ] Verify contact_phone field works
- [ ] Check candidate contact info displays

---

## 🎓 For Your Presentation

**What to say:**
> "Our system now includes comprehensive mobile number support. Each voter has a primary phone number for SMS OTP authentication, plus an optional secondary contact number. Candidates can also provide contact numbers so voters can reach them directly. All phone numbers are stored securely and masked in public APIs for privacy."

**Features**:
- Primary phone for SMS OTP authentication
- Optional secondary/emergency contact
- Candidate contact information
- Phone number validation (+91 format)
- Privacy-preserving display (masked)
- Secure storage in database

---

**Status**: ✅ Mobile number support fully implemented!

**Next**: Run SQL migration and update voter data with phone numbers.
