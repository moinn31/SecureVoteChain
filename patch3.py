with open('main.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('    raise HTTPException(status_code=400, detail="Import currently disabled due to system DLL policy.")\n}")\n', '    raise HTTPException(status_code=400, detail="Import currently disabled due to system DLL policy.")\n')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(c)
