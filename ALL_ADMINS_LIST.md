# 🔐 ALL ADMIN ACCOUNTS - QUICK REFERENCE

## 📋 Total: 37 Admins Created

### 🌟 Super Admin (1)
| Username | Password | State | Role |
|----------|----------|-------|------|
| `admin` | admin123 | All States | super_admin |

---

## 🗺️ State Admins (28 States)

| # | Username | Password | State | Role |
|---|----------|----------|-------|------|
| 1 | `admin_andhra_pradesh` | admin123 | Andhra Pradesh | state_admin |
| 2 | `admin_arunachal_pradesh` | admin123 | Arunachal Pradesh | state_admin |
| 3 | `admin_assam` | admin123 | Assam | state_admin |
| 4 | `admin_bihar` | admin123 | Bihar | state_admin |
| 5 | `admin_chhattisgarh` | admin123 | Chhattisgarh | state_admin |
| 6 | `admin_goa` | admin123 | Goa | state_admin |
| 7 | `admin_gujarat` | admin123 | Gujarat | state_admin |
| 8 | `admin_haryana` | admin123 | Haryana | state_admin |
| 9 | `admin_himachal_pradesh` | admin123 | Himachal Pradesh | state_admin |
| 10 | `admin_jharkhand` | admin123 | Jharkhand | state_admin |
| 11 | `admin_karnataka` | admin123 | Karnataka | state_admin |
| 12 | `admin_kerala` | admin123 | Kerala | state_admin |
| 13 | `admin_madhya_pradesh` | admin123 | Madhya Pradesh | state_admin |
| 14 | `admin_maharashtra` | admin123 | Maharashtra | state_admin |
| 15 | `admin_manipur` | admin123 | Manipur | state_admin |
| 16 | `admin_meghalaya` | admin123 | Meghalaya | state_admin |
| 17 | `admin_mizoram` | admin123 | Mizoram | state_admin |
| 18 | `admin_nagaland` | admin123 | Nagaland | state_admin |
| 19 | `admin_odisha` | admin123 | Odisha | state_admin |
| 20 | `admin_punjab` | admin123 | Punjab | state_admin |
| 21 | `admin_rajasthan` | admin123 | Rajasthan | state_admin |
| 22 | `admin_sikkim` | admin123 | Sikkim | state_admin |
| 23 | `admin_tamil_nadu` | admin123 | Tamil Nadu | state_admin |
| 24 | `admin_telangana` | admin123 | Telangana | state_admin |
| 25 | `admin_tripura` | admin123 | Tripura | state_admin |
| 26 | `admin_uttar_pradesh` | admin123 | Uttar Pradesh | state_admin |
| 27 | `admin_uttarakhand` | admin123 | Uttarakhand | state_admin |
| 28 | `admin_west_bengal` | admin123 | West Bengal | state_admin |

---

## 🏝️ Union Territory Admins (8 UTs)

| # | Username | Password | State/UT | Role |
|---|----------|----------|----------|------|
| 1 | `admin_andaman_nicobar` | admin123 | Andaman and Nicobar Islands | state_admin |
| 2 | `admin_chandigarh` | admin123 | Chandigarh | state_admin |
| 3 | `admin_dadra_nagar_haveli` | admin123 | Dadra and Nagar Haveli and Daman and Diu | state_admin |
| 4 | `admin_delhi` | admin123 | Delhi | state_admin |
| 5 | `admin_jammu_kashmir` | admin123 | Jammu and Kashmir | state_admin |
| 6 | `admin_ladakh` | admin123 | Ladakh | state_admin |
| 7 | `admin_lakshadweep` | admin123 | Lakshadweep | state_admin |
| 8 | `admin_puducherry` | admin123 | Puducherry | state_admin |

---

## 🚀 How to Use

### 1️⃣ Run SQL
```
1. Open Supabase SQL Editor
2. Copy ALL contents from RUN_THIS_SQL.sql
3. Paste and click RUN
4. Should show: "Success. 37 rows returned"
```

### 2️⃣ Restart Server
```powershell
cd SecureVoteChain
.venv\Scripts\Activate.ps1
python main.py
```

### 3️⃣ Test Login
```
Go to: http://127.0.0.1:5000/admin

Try any admin:
- Username: admin_maharashtra
- Password: admin123

OR

- Username: admin
- Password: admin123
```

---

## 🔍 Verify in Database

After running SQL, verify all admins were created:

```sql
-- Count total admins
SELECT COUNT(*) as total_admins FROM admins;
-- Should return: 37

-- View all admins
SELECT username, state, role FROM admins ORDER BY state;

-- View only super admins
SELECT username, state FROM admins WHERE role = 'super_admin';

-- View only state admins
SELECT username, state FROM admins WHERE role = 'state_admin' ORDER BY state;
```

---

## 🔐 Change Password for Specific Admin

```sql
-- Example: Change password for Maharashtra admin
UPDATE admins 
SET password_hash = encode(digest('new_secure_password', 'sha256'), 'hex'),
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'admin_maharashtra';
```

---

## 🛠️ Common Operations

### Deactivate an Admin
```sql
UPDATE admins 
SET is_active = false 
WHERE username = 'admin_goa';
```

### Reactivate an Admin
```sql
UPDATE admins 
SET is_active = true 
WHERE username = 'admin_goa';
```

### View Last Login Times
```sql
SELECT username, state, last_login 
FROM admins 
WHERE last_login IS NOT NULL
ORDER BY last_login DESC;
```

### Delete an Admin (Permanent)
```sql
DELETE FROM admins WHERE username = 'admin_test';
```

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **Default Password**: All admins have password `admin123`
2. **Change in Production**: Update passwords before going live!
3. **Strong Passwords**: Use minimum 12 characters with letters, numbers, symbols
4. **Regular Audits**: Check `last_login` column regularly
5. **Deactivate, Don't Delete**: Maintains audit trail

---

## 📧 Email Format

All admin emails follow pattern: `admin.{state_code}@securevotechain.com`

Examples:
- Maharashtra: `admin.mh@securevotechain.com`
- Delhi: `admin.dl@securevotechain.com`
- Tamil Nadu: `admin.tn@securevotechain.com`
- Super Admin: `admin@securevotechain.com`

---

## ✅ Quick Test Checklist

- [ ] SQL executed successfully (37 rows created)
- [ ] Server restarted without errors
- [ ] Can login as `admin` / `admin123`
- [ ] Can login as any state admin (e.g., `admin_delhi` / `admin123`)
- [ ] Dashboard shows correct state for state admin
- [ ] Super admin can see all states
- [ ] Session saves correctly (no errors in console)

---

## 🎯 Summary

✅ **37 Total Admins**
- 1 Super Admin (all states access)
- 28 State Admins (one per state)
- 8 UT Admins (one per union territory)

✅ **All use password**: `admin123`

✅ **SQL File**: `RUN_THIS_SQL.sql`

✅ **Ready to use** after running SQL and restarting server!

🚀 **Next**: Run the SQL and test login!
