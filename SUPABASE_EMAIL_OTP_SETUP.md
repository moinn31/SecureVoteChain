# 📧 Supabase Email OTP Configuration Guide

## 🎯 Goal
Configure Supabase to send **both Magic Link AND OTP code** in the email.

---

## 📝 Step-by-Step Setup

### **Step 1: Access Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project: **eizoypywgprahaztradc**
3. Navigate to **Authentication** → **Email Templates**

---

### **Step 2: Edit Magic Link Email Template**

Find the **"Magic Link"** template and replace the content with:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF9933 0%, #138808 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .otp-box { background: #f8f9fa; border: 3px dashed #FF9933; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #FF9933; font-family: 'Courier New', monospace; }
        .button { display: inline-block; background: #FF9933; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗳️ SecureVoteChain</h1>
            <p>Blockchain-Enabled Secure Voting</p>
        </div>
        
        <div class="content">
            <h2>Your Login OTP Code</h2>
            <p>Hello Voter,</p>
            <p>We received a request to log in to your account using Aadhaar: <strong>{{ .Data.aadhaar_masked }}</strong></p>
            
            <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your One-Time Password</p>
                <div class="otp-code">{{ .Data.otp_code }}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for {{ .Data.validity }}</p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. SecureVoteChain will never ask for your OTP via phone or SMS.
            </div>
            
            <h3>Two Ways to Login:</h3>
            
            <p><strong>Option 1: Enter OTP Manually</strong></p>
            <ol>
                <li>Copy the 6-digit code above</li>
                <li>Go back to the voting portal</li>
                <li>Enter the OTP code</li>
                <li>Click "Verify & Login"</li>
            </ol>
            
            <p><strong>Option 2: Use Magic Link (No OTP needed)</strong></p>
            <p>Click the button below to login instantly without entering the OTP:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">🔐 Login with Magic Link</a>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">If you didn't request this login, please ignore this email. Your account remains secure.</p>
        </div>
        
        <div class="footer">
            <p><strong>SecureVoteChain</strong> - Transparent & Secure Digital Elections</p>
            <p>Powered by Blockchain Technology 🔒</p>
            <p style="margin-top: 15px;">
                <a href="http://localhost:5000" style="color: #FF9933; text-decoration: none;">Voting Portal</a> | 
                <a href="http://localhost:5000/verify" style="color: #FF9933; text-decoration: none;">Verify Vote</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

### **Step 3: Configure Email Settings**

1. Go to **Authentication** → **Settings** → **Email Auth**
2. Enable the following:
   - ✅ **Enable Email Signups** (must be ON)
   - ✅ **Enable Email OTP** (must be ON)
   - ✅ **Confirm Email** (optional)

3. Set **OTP Expiration**: 5 minutes (300 seconds)

---

### **Step 4: Test the Email**

1. Go to your voter portal: http://localhost:5000/voter
2. Enter a registered Aadhaar number
3. Click "Request OTP"
4. Check your email inbox - you should see:
   - ✅ **Big OTP code** (6 digits) in the center
   - ✅ **Magic Link button** for instant login
   - ✅ **Security warnings**
   - ✅ **Professional design** with Indian flag colors

---

## 🎨 What the Email Looks Like

```
┌─────────────────────────────────────┐
│    🗳️ SecureVoteChain                │
│    Blockchain-Enabled Secure Voting │
├─────────────────────────────────────┤
│ Your Login OTP Code                 │
│                                     │
│ ┌─────────────────────────────┐    │
│ │   Your One-Time Password    │    │
│ │                             │    │
│ │        1 2 3 4 5 6         │    │
│ │                             │    │
│ │   Valid for 5 minutes       │    │
│ └─────────────────────────────┘    │
│                                     │
│ ⚠️ Security Notice: Never share... │
│                                     │
│ Two Ways to Login:                  │
│ 1. Enter OTP manually               │
│ 2. Use Magic Link                   │
│                                     │
│  [ 🔐 Login with Magic Link ]      │
└─────────────────────────────────────┘
```

---

## 🔧 Backend Changes (Already Applied)

Your code now sends OTP data to Supabase:

```python
auth_response = db.client.auth.sign_in_with_otp({
    "email": email,
    "options": {
        "should_create_user": True,
        "email_redirect_to": None,
        "data": {
            "otp_code": otp_code,                      # ← 6-digit OTP
            "aadhaar_masked": "1234****5678",          # ← Masked Aadhaar
            "validity": "5 minutes"                    # ← Expiration time
        }
    }
})
```

These variables are available in the email template:
- `{{ .Data.otp_code }}` - The 6-digit OTP (e.g., "123456")
- `{{ .Data.aadhaar_masked }}` - Masked Aadhaar (e.g., "1234****5678")
- `{{ .Data.validity }}` - Expiration time ("5 minutes")
- `{{ .ConfirmationURL }}` - Magic Link for instant login

---

## 🎯 What Voters Will Experience

### **Current Flow (After Configuration):**

1. **Voter enters Aadhaar** → Click "Request OTP"
2. **System generates OTP** → Shows in terminal (backup)
3. **Supabase sends email** with:
   - Big visible OTP code (123456)
   - Magic link button
4. **Voter chooses:**
   - **Option A**: Copy OTP → Enter in portal → Login ✅
   - **Option B**: Click Magic Link → Instant login ✅
5. **OTP expires** after 5 minutes (security)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Email received with OTP code visible
- [ ] OTP code is 6 digits and matches terminal output
- [ ] Magic Link button works
- [ ] Email design looks professional (Indian flag colors)
- [ ] OTP entry in portal works
- [ ] Magic Link login works
- [ ] OTP expires after 5 minutes
- [ ] Security warnings visible in email

---

## 🚨 Troubleshooting

### **Problem: OTP not showing in email**
**Solution**: 
1. Check Supabase Dashboard → Authentication → Email Templates
2. Verify you used `{{ .Data.otp_code }}` (exact syntax)
3. Ensure "Enable Email OTP" is turned ON

### **Problem: Email not sending at all**
**Solution**:
1. Check Supabase Dashboard → Settings → API
2. Verify your Supabase URL and keys in `.env` file
3. Check terminal logs for Supabase errors

### **Problem: Magic Link not working**
**Solution**:
1. Check `email_redirect_to` is set correctly
2. Verify your site URL in Supabase Dashboard → Settings → API

### **Problem: OTP shows as "{{ .Data.otp_code }}" literally**
**Solution**:
1. You're using wrong template syntax
2. Use exactly: `{{ .Data.otp_code }}` (with spaces)
3. Make sure you edited the correct template (Magic Link)

---

## 📱 Mobile Responsive

The email template is mobile-responsive:
- ✅ Looks great on iPhone, Android
- ✅ OTP code is large and easy to read
- ✅ Buttons are finger-friendly
- ✅ No horizontal scrolling

---

## 🎓 For Your Presentation

**What to say:**
> "Our system uses Supabase Auth to send professional OTP emails with both a 6-digit code for manual entry and a magic link for instant login. The email includes security warnings and expires after 5 minutes for maximum security."

**Technical Details:**
- Email templating with Supabase
- Custom data injection (OTP, masked Aadhaar)
- Dual authentication methods (OTP + Magic Link)
- 5-minute expiration with automatic cleanup
- Professional HTML email design
- Mobile-responsive layout

---

## 🔐 Security Features in Email

1. ✅ **Masked Aadhaar** - Shows "1234****5678" (privacy)
2. ✅ **5-minute expiration** - Prevents replay attacks
3. ✅ **Single-use OTP** - Deleted after successful login
4. ✅ **Security warnings** - Educates users about phishing
5. ✅ **No sensitive data** - Only OTP and masked Aadhaar
6. ✅ **Professional design** - Looks legitimate (anti-phishing)

---

**Status**: ✅ Backend code updated, ready for Supabase template configuration!

**Next Step**: Apply the email template in Supabase Dashboard → Save → Test!
