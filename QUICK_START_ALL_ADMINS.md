# 🚀 QUICK START - Add All Admins

## ✅ What You Get

**37 Admin Accounts** - One for each state/UT + 1 super admin

All admins use password: **`admin123`**

---

## 📝 Step 1: Copy SQL

Open file: **`RUN_THIS_SQL.sql`**

Select ALL text (Ctrl+A) and Copy (Ctrl+C)

---

## 🗄️ Step 2: Run in Supabase

1. Go to: https://eizoypywgprahaztradc.supabase.co
2. Click **"SQL Editor"** in left menu
3. Click **"New Query"**
4. **Paste** the SQL (Ctrl+V)
5. Click **"RUN"** button (or press Ctrl+Enter)

### ✅ Success Message:
```
Success. 37 rows returned
```

You should see a table with all 37 admins!

---

## 🔄 Step 3: Restart Server

In your terminal, stop server (Ctrl+C if running), then:

```powershell
cd SecureVoteChain
.venv\Scripts\Activate.ps1
python main.py
```

Should show:
```
✅ AdminAuth configured to use database authentication
✅ Connected to Secure Supabase PostgreSQL database
```

---

## 🧪 Step 4: Test Login

1. Open: http://127.0.0.1:5000/admin

2. Try any admin:

**Example 1 - Super Admin:**
- Username: `admin`
- Password: `admin123`

**Example 2 - Maharashtra:**
- Username: `admin_maharashtra`
- Password: `admin123`

**Example 3 - Delhi:**
- Username: `admin_delhi`
- Password: `admin123`

Should login successfully! ✅

---

## 📋 All Admin Usernames

### Super Admin:
- `admin` (access all states)

### State Admins (28):
```
admin_andhra_pradesh        admin_karnataka
admin_arunachal_pradesh     admin_kerala
admin_assam                 admin_madhya_pradesh
admin_bihar                 admin_maharashtra
admin_chhattisgarh         admin_manipur
admin_goa                   admin_meghalaya
admin_gujarat               admin_mizoram
admin_haryana               admin_nagaland
admin_himachal_pradesh      admin_odisha
admin_jharkhand             admin_punjab
admin_rajasthan             admin_sikkim
admin_tamil_nadu            admin_telangana
admin_tripura               admin_uttar_pradesh
admin_uttarakhand           admin_west_bengal
```

### UT Admins (8):
```
admin_andaman_nicobar
admin_chandigarh
admin_dadra_nagar_haveli
admin_delhi
admin_jammu_kashmir
admin_ladakh
admin_lakshadweep
admin_puducherry
```

**All use password:** `admin123`

---

## 🔍 Verify in Supabase

After running SQL, check in Supabase:

1. Click **"Table Editor"** in left menu
2. Select **"admins"** table
3. Should see 37 rows!

---

## ❓ Troubleshooting

### "Table admins already exists"
The SQL drops existing table first. If error persists:
```sql
DROP TABLE IF EXISTS admins CASCADE;
```
Then run the full SQL again.

### "Admin can't login"
1. Check table exists: `SELECT COUNT(*) FROM admins;`
2. Check admin exists: `SELECT * FROM admins WHERE username = 'admin';`
3. Restart server
4. Clear browser cache

### "Database not configured"
Restart the server - AdminAuth needs to initialize.

---

## 📚 Full Documentation

- **All Admin List**: See `ALL_ADMINS_LIST.md`
- **Setup Guide**: See `DATABASE_AUTH_SETUP.md`
- **Password Generator**: Run `python generate_admin_password.py`

---

## ⚠️ Security Note

**Change default passwords in production!**

To change password:
```sql
UPDATE admins 
SET password_hash = encode(digest('new_password', 'sha256'), 'hex')
WHERE username = 'admin_maharashtra';
```

Or use: `python generate_admin_password.py`

---

## ✅ Done!

You now have **37 admins** ready to use! 🎉

**Next**: Run the SQL and test login!
