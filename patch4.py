import re

with open('main.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(r'(@app\.get\("/api/admin/download-template"\)\nasync def download_template\(request: Request\):\n).*', r'\1    raise HTTPException(status_code=400, detail="Download currently disabled due to system DLL policy.")\n', c, count=1)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(c)
