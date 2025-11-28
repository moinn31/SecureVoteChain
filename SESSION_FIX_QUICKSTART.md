# 🚀 SESSION FIX - QUICK START

## What Was Fixed
✅ Session logout on page reload - **FIXED**
✅ RLS table name errors - **FIXED**

## You Must Do 3 Things:

### 1️⃣ Run SQL (1 minute)
1. Open: https://supabase.com/dashboard/project/eizoypywgprahaztradc/sql
2. Copy content from `fix_all_rls.sql`
3. Paste and click "Run"

### 2️⃣ Hard Refresh Browser (5 seconds)
Press: `Ctrl + Shift + R` (Chrome/Edge) or `Ctrl + F5` (Firefox)

### 3️⃣ Test (2 minutes)

**Test Admin:**
1. Go to http://127.0.0.1:5000/admin
2. Login: username=`admin`, password=`admin123`
3. Press F5 (refresh)
4. ✅ Should stay logged in

**Test Voter:**
1. Go to http://127.0.0.1:5000/voter
2. Register/Login
3. Press F5 (refresh)
4. ✅ Should stay logged in

## If It Still Logs You Out

1. Press F12 (open DevTools)
2. Go to Console tab
3. Check for error messages
4. Take screenshot and share with me

## Debug Commands

Open Console (F12) and type:

```javascript
// Check if session is saved
localStorage.getItem('adminToken')
localStorage.getItem('voterToken')

// Clear and retry
localStorage.clear()
location.reload()
```

---

**See `FIXED_ISSUES.md` for detailed testing guide**
