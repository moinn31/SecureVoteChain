# 🚀 Setup Supabase Database Tables

## The Issue
You're getting login errors because the database tables don't exist in Supabase yet. The application is trying to save sessions but the `sessions` table hasn't been created.

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://eizoypywgprahaztradc.supabase.co
2. Click on the **SQL Editor** icon in the left sidebar (looks like `</>`)
3. Click **"+ New query"**

### Step 2: Run the Database Schema
1. Open the file `database_schema.sql` in this project
2. Copy ALL the SQL code (Ctrl+A, Ctrl+C)
3. Paste it into the Supabase SQL Editor
4. Click the **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Tables Created
After running the SQL, you should see:
- ✅ 6 tables created successfully
- ✅ Indexes created
- ✅ Functions created

The tables are:
- `elections` - Store election data
- `voters` - Store registered voters
- `votes` - Store cast votes
- `sessions` - Store login sessions (REQUIRED for login!)
- `audit_logs` - Track all actions
- `blockchain` - Store blockchain data

### Step 4: Test Admin Login
Now try logging into the admin panel:

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**State-specific Admins:**
- Maharashtra: `admin_maharashtra` / `mh123`
- Delhi: `admin_delhi` / `dl123`
- Karnataka: `admin_karnataka` / `ka123`
- Tamil Nadu: `admin_tamilnadu` / `tn123`

## Alternative: Quick SQL Command

If you want to do it super fast, just run this in Supabase SQL Editor:

```sql
-- Just create the sessions table (minimum required for login)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_sessions_token ON sessions(token);
```

But it's **strongly recommended** to run the full `database_schema.sql` to create all tables!

## Troubleshooting

### "Table already exists" error
- This is OK! It means some tables were already created
- The schema uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times

### Still can't login?
1. Check browser console (F12) for errors
2. Check the terminal where uvicorn is running for error messages
3. Make sure your `.env` file has the correct Supabase credentials

### Want to verify tables exist?
Run this in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see all 6 tables listed!
