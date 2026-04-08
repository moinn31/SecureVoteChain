import re
with open('main.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Regex to match the entire import_voters def
c = re.sub(r'@app\.post\("/api/admin/import-voters"\).*?def import_voters.*?return.*?except.*?Exception.*?raise HTTPException\([^)]+\)', '''@app.post("/api/admin/import-voters")
async def import_voters(request: Request, file: UploadFile = File(...)):
    raise HTTPException(status_code=400, detail="Import currently disabled due to system DLL policy.")
''', c, flags=re.DOTALL)

c = re.sub(r'@app\.get\("/api/admin/download-template"\).*?def download_template.*?return.*?except.*?Exception.*?raise HTTPException\([^)]+\)', '''@app.get("/api/admin/download-template")
async def download_template(request: Request):
    raise HTTPException(status_code=400, detail="Download currently disabled due to system DLL policy.")
''', c, flags=re.DOTALL)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(c)
