# 🚀 Quick Start - Localhost Configuration

## ✅ Server Configuration

### Backend Server
- **URL:** http://localhost:5000
- **Binding:** localhost only (NOT 0.0.0.0)
- **CORS:** Restricted to localhost origins only
- **No Gunicorn:** Uses Uvicorn development server

### Frontend (if applicable)
- **URL:** http://localhost:3000
- **Must use:** localhost (not 127.0.0.1)

---

## 🚀 Start the Server

### Option 1: Direct Python
```powershell
cd SecureVoteChain
python main.py
```

### Option 2: Start Script (Windows)
```powershell
cd SecureVoteChain
.\start_server.bat
```

### Option 3: Start Script (Linux/Mac)
```bash
cd SecureVoteChain
chmod +x start_server.sh
./start_server.sh
```

---

## 🔒 Security Configuration

### CORS Settings (main.py)
```python
allow_origins=[
    "http://localhost:3000",  # Frontend
    "http://localhost:5000",  # Backend
    "http://localhost:8000"   # Alternative port
]
```

**NOT allowed:**
- ❌ http://0.0.0.0:*
- ❌ http://127.0.0.1:*
- ❌ Any external IPs
- ❌ Wildcard (*)

### Server Binding
```python
uvicorn.run(app, host="localhost", port=5000)
```

**Why localhost?**
- ✅ More secure (only local connections)
- ✅ Prevents external access
- ✅ Better CORS control
- ✅ Development best practice

---

## 🧪 Testing

### 1. Start Server
```powershell
python main.py
```

**Expected output:**
```
✅ Connected to Secure Supabase PostgreSQL database
🔒 Encryption enabled for sensitive data
✅ AdminAuth configured to use database authentication
INFO:     Uvicorn running on http://localhost:5000 (Press CTRL+C to quit)
```

### 2. Access Application

**Admin Portal:**
```
http://localhost:5000/admin
```

**Voter Portal:**
```
http://localhost:5000/voter
```

**API Health Check:**
```
http://localhost:5000/
```

### 3. Verify CORS

Open browser console (F12):
```javascript
// Should work:
fetch('http://localhost:5000/api/states')
  .then(r => r.json())
  .then(console.log)

// Should fail (CORS blocked):
// Requests from non-localhost origins
```

---

## ⚠️ Important Notes

### DO NOT Use:
- ❌ `uvicorn.run(app, host="0.0.0.0")` - Binds to all interfaces
- ❌ `flask run --host=0.0.0.0` - Exposes externally
- ❌ Gunicorn in development - Not needed for local dev
- ❌ `allow_origins=["*"]` - Too permissive

### DO Use:
- ✅ `uvicorn.run(app, host="localhost")` - Local only
- ✅ Specific CORS origins
- ✅ Development server (Uvicorn)
- ✅ localhost URLs everywhere

---

## 🛠️ Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"
**Solution:** Make sure you're accessing via `http://localhost:5000`, not `http://127.0.0.1:5000`

### Error: "Connection refused"
**Solution:** 
1. Check if server is running: `netstat -an | findstr 5000` (Windows)
2. Make sure using `localhost` not `0.0.0.0`
3. Restart server

### Error: "Module 'uvicorn' not found"
**Solution:**
```powershell
pip install uvicorn
```

### Frontend can't connect to backend
**Solution:**
1. Both must use `localhost` (not 127.0.0.1)
2. Check CORS origins in `main.py`
3. Verify server is running on port 5000

---

## 📋 Configuration Checklist

- [x] Server binds to `localhost` only
- [x] CORS allows `http://localhost:*` only
- [x] No Gunicorn configuration
- [x] Using Uvicorn development server
- [x] Frontend URL uses `localhost`
- [x] Backend URL uses `localhost`
- [x] No wildcard (`*`) in CORS
- [x] No `0.0.0.0` binding

---

## ✅ Current Configuration

**File:** `SecureVoteChain/main.py`

```python
# CORS - localhost only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000", 
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Server - localhost only
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=5000, reload=False)
```

**Perfect for local development! ✅**
