# 🗄️ Supabase PostgreSQL Database Setup Guide

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Create a new project:
   - Project Name: `SecureVoteChain`
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
   - Click "Create new project"

## Step 2: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the SQL from `database_schema.sql`
4. Click "Run" to create all tables

## Step 3: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

## Step 4: Configure Your Application

### Option A: Using Environment Variables (Recommended)

**Windows (PowerShell):**
```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_KEY="your-anon-key"
```

**Linux/Mac:**
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
```

### Option B: Using .env File

1. Create a `.env` file in your project root:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

2. Install python-dotenv:
```bash
pip install python-dotenv
```

3. Add to your main.py:
```python
from dotenv import load_dotenv
load_dotenv()
```

## Step 5: Install Supabase Python Library

```bash
pip install supabase
```

Or add to your requirements.txt:
```
supabase==2.3.0
python-dotenv==1.0.0
```

## Step 6: Switch to Supabase Database

In your `main.py`, change:
```python
from backend.database import Database
db = Database()
```

To:
```python
from backend.supabase_db import SupabaseDatabase
db = SupabaseDatabase()
```

## 🔒 Security Best Practices

1. **Never commit credentials to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Row Level Security (RLS)**
   - Enable RLS on all tables in Supabase
   - Configure policies for read/write access

3. **Use Service Role Key for Backend Only**
   - The anon key is for client-side
   - For sensitive operations, use service_role key (keep it secret!)

4. **Enable SSL/TLS**
   - Supabase uses HTTPS by default
   - Ensure all connections are encrypted

## 📊 Database Features You Get

✅ **Automatic Backups** - Daily backups included
✅ **Real-time Subscriptions** - Listen to database changes
✅ **Auto-generated API** - REST and GraphQL endpoints
✅ **Authentication** - Built-in auth system
✅ **Storage** - File storage for documents/images
✅ **Edge Functions** - Serverless functions
✅ **Free Tier** - 500MB database, 1GB file storage

## 🚀 Deployment Options

### Free Hosting Options:
1. **Vercel** - Great for FastAPI
2. **Railway** - Easy PostgreSQL + Python
3. **Render** - Free tier available
4. **Fly.io** - Global edge deployment

### Production Hosting:
1. **AWS EC2** + Supabase
2. **Google Cloud Run** + Supabase
3. **Digital Ocean** + Supabase
4. **Azure Web Apps** + Supabase

## 📈 Monitoring & Analytics

In Supabase Dashboard:
- **Database** → View tables, run queries
- **API Docs** → Auto-generated API documentation
- **Logs** → Real-time logs and errors
- **Reports** → Usage statistics

## 🔄 Migration from JSON to PostgreSQL

Your current JSON files will be preserved. To migrate:

1. Run the application once with new database
2. Your existing data structure remains compatible
3. New data automatically saves to PostgreSQL
4. Keep JSON files as backup

## ⚡ Performance Benefits

- **10x faster queries** compared to JSON files
- **Concurrent access** - multiple users simultaneously
- **ACID transactions** - data integrity guaranteed
- **Indexing** - fast searches on millions of records
- **Scalability** - handles production traffic

## 🆘 Troubleshooting

**Error: "Missing Supabase credentials"**
- Solution: Set SUPABASE_URL and SUPABASE_KEY environment variables

**Error: "Connection refused"**
- Solution: Check your internet connection and Supabase URL

**Error: "Invalid API key"**
- Solution: Verify you're using the correct anon key from Supabase dashboard

**Error: "Table does not exist"**
- Solution: Run the SQL schema script in Supabase SQL Editor

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

---

Need help? Contact: support@securevotechain.com
