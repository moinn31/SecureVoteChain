# Admin Management Guide

## Default Admin Accounts

After running `create_admins_table.sql`, you'll have these admin accounts:

| Username | Password | State | Role |
|----------|----------|-------|------|
| admin | admin123 | All States | super_admin |
| admin_maharashtra | mh123 | Maharashtra | state_admin |
| admin_delhi | dl123 | Delhi | state_admin |
| admin_karnataka | ka123 | Karnataka | state_admin |
| admin_tamilnadu | tn123 | Tamil Nadu | state_admin |

## How to Add New Admin

### Method 1: Using Python (Generate Password Hash)

```python
import hashlib

username = "admin_newstate"
password = "secure_password_123"
state = "Gujarat"
role = "state_admin"
email = "admin.gj@securevotechain.com"

# Generate SHA-256 hash
password_hash = hashlib.sha256(password.encode()).hexdigest()
print(f"Password hash: {password_hash}")
```

### Method 2: Direct SQL Insert

```sql
-- Replace values with your admin details
INSERT INTO admins (username, password_hash, email, state, role) VALUES
('admin_gujarat', 'YOUR_PASSWORD_HASH_HERE', 'admin.gj@securevotechain.com', 'Gujarat', 'state_admin');
```

### Method 3: Using SQL with Inline Hash Generation (PostgreSQL)

```sql
-- Add new admin with password hashed inline
INSERT INTO admins (username, password_hash, email, state, role) VALUES
('admin_gujarat', 
 encode(digest('your_password_here', 'sha256'), 'hex'), 
 'admin.gj@securevotechain.com', 
 'Gujarat', 
 'state_admin');
```

## Common Admin Operations

### Update Admin Password

```sql
-- Update password for existing admin
UPDATE admins 
SET password_hash = encode(digest('new_password_here', 'sha256'), 'hex'),
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'admin_gujarat';
```

### Deactivate Admin (Don't Delete)

```sql
UPDATE admins 
SET is_active = false,
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'admin_gujarat';
```

### Reactivate Admin

```sql
UPDATE admins 
SET is_active = true,
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'admin_gujarat';
```

### Delete Admin (Permanent)

```sql
DELETE FROM admins WHERE username = 'admin_gujarat';
```

### View All Admins

```sql
SELECT username, email, state, role, is_active, created_at, last_login 
FROM admins 
ORDER BY created_at DESC;
```

### View Active Admins Only

```sql
SELECT username, email, state, role, last_login 
FROM admins 
WHERE is_active = true
ORDER BY state, username;
```

## Password Hash Generation Examples

### Python Script to Generate Hash

Create a file `generate_admin_hash.py`:

```python
import hashlib

def generate_admin_hash(password):
    """Generate SHA-256 hash for admin password."""
    return hashlib.sha256(password.encode()).hexdigest()

# Example usage
if __name__ == "__main__":
    password = input("Enter password: ")
    hash_value = generate_admin_hash(password)
    print(f"\nPassword: {password}")
    print(f"SHA-256 Hash: {hash_value}")
    print(f"\nSQL INSERT example:")
    print(f"INSERT INTO admins (username, password_hash, email, state, role) VALUES")
    print(f"('your_username', '{hash_value}', 'your@email.com', 'Your State', 'state_admin');")
```

Run: `python generate_admin_hash.py`

## Role Types

- **super_admin**: Access to all states and all elections
- **state_admin**: Access only to elections in their assigned state

## Security Notes

⚠️ **Important:**
- Never store passwords in plain text
- Always use SHA-256 hashed passwords
- Change default passwords immediately in production
- Use strong passwords (minimum 8 characters, mix of letters, numbers, symbols)
- Regularly audit admin access logs
- Deactivate admins instead of deleting to maintain audit trail

## Quick Start Commands

### 1. Run SQL to Create Table and Insert Default Admins
```sql
-- Copy and paste contents of create_admins_table.sql into Supabase SQL Editor
```

### 2. Verify Admins Created
```sql
SELECT * FROM admins;
```

### 3. Test Admin Login
- Go to http://127.0.0.1:5000/admin
- Username: `admin`
- Password: `admin123`

## Troubleshooting

### Admin Can't Login
1. Check if admin exists and is active:
   ```sql
   SELECT username, is_active FROM admins WHERE username = 'your_username';
   ```

2. Verify password hash:
   ```python
   import hashlib
   print(hashlib.sha256("your_password".encode()).hexdigest())
   ```
   Compare with hash in database.

### Admin Table Not Found
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'admins';
```

If missing, run `create_admins_table.sql` again.
