import uuid

def patch_file():
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('raise HTTPException(status_code=400, detail="Import currently disabled due to system DLL policy."))', 'raise HTTPException(status_code=400, detail="Import currently disabled due to system DLL policy.")')
    
    # Let me also remove pandas from download template
    content = content.replace("sample_data = pd.DataFrame({", "raise HTTPException(status_code=400, detail='Download currently disabled due to system DLL policy.')")

    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(content)

patch_file()
