# Quick Testing Guide - SecureVoteChain

## 🚀 Start Testing in 3 Steps

### Step 1: Start Server
```bash
cd c:\Users\moinm\Desktop\SecureVoteChain\SecureVoteChain
start_server.bat
```
Wait for:
```
✅ Connected to Secure Supabase PostgreSQL database
🔒 Encryption enabled for sensitive data
✅ Admins table accessible
INFO:     Uvicorn running on http://localhost:5000
```

### Step 2: Login to Admin Panel
```
URL: http://localhost:5000/admin

Use any admin credentials from your database
Example:
- Username: admin@securevote
- Password: (your admin password)
```

### Step 3: Test Each Feature

#### ✅ Test 1: Create Election (2 minutes)
1. Click **"Create Election"** in sidebar
2. Fill in:
   - Title: "Test Election 2024"
   - Description: "Testing election creation"
   - State: Select your state
   - Start Time: (select current date/time)
   - End Time: (select future date/time)
3. Add Candidates:
   - Candidate 1: Name, Party, Photo, Logo
   - Click "Add Another Candidate"
   - Candidate 2: Name, Party, Photo, Logo
4. Click **"Create Election"**
5. ✅ Should see: "Election created successfully!"
6. Click **"Elections"** → Should see your new election with **"active"** status

#### ✅ Test 2: Import Voters (3 minutes)
1. Click **"Import Voters"** in sidebar
2. Click **"📥 Download CSV Template"**
3. Open template in Excel
4. Add 3 sample voters:
   ```
   aadhaar,name,state,voter_id,voting_token
   123456789012,Test Voter 1,Maharashtra,VOTER001,TOKEN001
   123456789013,Test Voter 2,Maharashtra,VOTER002,TOKEN002
   123456789014,Test Voter 3,Maharashtra,VOTER003,TOKEN003
   ```
5. Save file as `voters_import.csv`
6. Click **"📁 Select File"** → Choose your CSV
7. Click **"📤 Upload Voters"**
8. ✅ Should see: "Successfully imported 3 voters"

#### ✅ Test 3: Voter Registration (1 minute)
1. Open new tab: `http://localhost:5000/`
2. Click **"Register New Voter"**
3. Fill form:
   - Aadhaar: 123456789015
   - Name: Test Voter 4
   - State: Maharashtra
   - Voter ID: VOTER004
   - Voting Token: TOKEN004
4. Click **"Register"**
5. ✅ Should see success message with credentials
6. **IMPORTANT:** Save the voter_id and token shown!

#### ✅ Test 4: Election Status Changes (Quick Check)
1. In admin panel, click **"Elections"**
2. Check your test election:
   - If start_time is in future → Should show **"pending"**
   - If start_time is past and end_time is future → Should show **"active"**
   - If end_time is past → Should show **"ended"**
3. ✅ Status should match the current time vs election times

#### ✅ Test 5: Cast Vote (2 minutes)
1. Use credentials from Test 3 (or imported voter)
2. In voter portal, enter:
   - Voter ID: VOTER004
   - Voting Token: TOKEN004
3. Click **"Login"**
4. Select your test election
5. Choose a candidate
6. Click **"Cast Vote"**
7. ✅ Should see vote confirmation with receipt

#### ✅ Test 6: View Results (1 minute)
1. Go back to admin panel
2. Click **"Elections"**
3. Find your test election
4. Click **"📊 View Live Results Chart"**
5. ✅ Should see:
   - Bar chart with candidate votes
   - Total votes cast
   - Voter turnout percentage

---

## 🔍 Expected Results

### After All Tests:
- ✅ 1 election created
- ✅ 3 voters imported via CSV
- ✅ 1 voter registered manually
- ✅ Total: 4 voters registered
- ✅ 1 vote cast
- ✅ Results showing correctly

### Dashboard Stats Should Show:
- Total Elections: 1
- Active Elections: 1 (if within time range)
- Total Votes: 1
- Registered Voters: 4
- Blockchain Blocks: 1+

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: "Elections panel is empty"
**Fix:**
1. Check if you're logged in as admin
2. Verify session token in browser console:
   ```javascript
   localStorage.getItem('adminToken')
   ```
3. Create a new election if none exist

### Issue 2: "Import Voters button not visible"
**Fix:**
1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear browser cache
3. Check browser console for errors

### Issue 3: "Voter registration fails"
**Fix:**
1. Check server terminal for errors
2. Verify Supabase connection (green ✅ messages)
3. Ensure .env file has correct SUPABASE_URL and SUPABASE_KEY

### Issue 4: "Cannot upload voters CSV"
**Fix:**
1. Use the downloaded template exactly
2. Don't change column names
3. Save as CSV (not XLSX for first try)
4. Max file size: 5MB

### Issue 5: "Election status not changing"
**Fix:**
1. Refresh the Elections page
2. Check start_time and end_time are correct
3. Server calculates status on each page load

---

## 📊 Verification Checklist

After testing, verify in Supabase dashboard:

### Check `elections` table:
```sql
SELECT title, state, status, start_time, end_time 
FROM elections 
ORDER BY created_at DESC;
```
✅ Should show your test election

### Check `voters` table:
```sql
SELECT voter_id, state, created_at 
FROM voters 
ORDER BY created_at DESC 
LIMIT 10;
```
✅ Should show 4 voters (3 imported + 1 manual)

### Check `votes` table:
```sql
SELECT election_id, created_at 
FROM votes 
ORDER BY created_at DESC;
```
✅ Should show 1 vote

### Check `secure_audit_logs` table:
```sql
SELECT action, username, details, created_at 
FROM secure_audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```
✅ Should show:
- Admin login
- Election created
- Voters imported
- Vote cast

---

## 🎯 Performance Check

### Expected Response Times:
- Admin login: < 1 second
- Load elections: < 2 seconds
- Import 100 voters: < 5 seconds
- Cast vote: < 2 seconds
- View results: < 3 seconds

### If Slow:
1. Check internet connection
2. Verify Supabase region (should be closest to you)
3. Check browser network tab for slow requests

---

## 🔐 Security Verification

### Verify CORS Protection:
1. Try accessing from non-localhost URL
2. ✅ Should be blocked
3. Only http://localhost:* URLs should work

### Verify Session Persistence:
1. Login as admin
2. Refresh page (F5)
3. ✅ Should stay logged in
4. Close browser
5. Reopen http://localhost:5000/admin
6. ✅ Should still be logged in

### Verify State Isolation:
1. Login as state admin (not super admin)
2. Create election for your state
3. ✅ Should only see elections for your state
4. ✅ Should NOT see other states' elections

---

## 🎉 Success Criteria

All tests pass if:
- ✅ Server starts without errors
- ✅ Admin can login and session persists
- ✅ Elections can be created and displayed
- ✅ Import Voters works with CSV
- ✅ Manual voter registration works
- ✅ Election status updates based on time
- ✅ Votes can be cast
- ✅ Results are displayed correctly
- ✅ All navigation items work
- ✅ No errors in browser console
- ✅ No errors in server terminal

---

## 📞 If You Need Help

### Debug Steps:
1. **Browser Console** (F12):
   - Check for JavaScript errors
   - Look for failed API calls in Network tab

2. **Server Terminal**:
   - Check for Python errors
   - Look for database connection issues

3. **Supabase Dashboard**:
   - Verify tables exist
   - Check RLS is disabled on admins table
   - Verify data is being inserted

### Error Messages to Look For:
- ✅ GOOD: "Connected to Secure Supabase PostgreSQL database"
- ✅ GOOD: "Admins table accessible"
- ❌ BAD: "Cannot access admins table"
- ❌ BAD: "Missing Supabase credentials"
- ❌ BAD: "AttributeError"

---

**Testing Time:** ~15 minutes for all tests  
**Success Rate:** Should be 100% if all fixes applied correctly  
**Status:** Ready for Production Testing ✅
