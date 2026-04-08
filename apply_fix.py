with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# We will match from @app.post("/api/admin/import-voters") to the end of the function (which is the except block at the end of it).
# I'll just use a targeted string replace approach instead.
start_idx = text.find('@app.post("/api/admin/import-voters")')
end_idx = text.find('@app.get("/api/admin/download-voter-template")')

if start_idx != -1 and end_idx != -1:
    before = text[:start_idx]
    after = text[end_idx:]
    
    new_impl = '''@app.post("/api/admin/import-voters")
async def import_voters(request: Request, file: UploadFile = File(...)):
    """Import voters from CSV file (admin only)."""
    session = check_admin_access(request)
    admin_state = session.get("state")
    
    try:
        # Read file content
        contents = await file.read()
        
        # We will parse CSV specifically (pandas is disabled to bypass AppLocker)
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only .csv files are supported. Please convert your Excel file to CSV format.")
        
        import csv
        import io
        import secrets
        
        text_content = contents.decode("utf-8")
        
        # Read the CSV
        csv_file = io.StringIO(text_content)
        reader = csv.DictReader(csv_file)
        
        # Normalize headers to lowercase
        headers = [h.strip().lower() for h in reader.fieldnames] if reader.fieldnames else []
        
        # Map columns
        column_mapping = {'aadhaar_number': 'aadhaar'}
        mapped_headers = [column_mapping.get(h, h) for h in headers]
        
        reader.fieldnames = mapped_headers
        
        required_columns = ['name', 'aadhaar', 'state', 'phone']
        missing_columns = [col for col in required_columns if col not in mapped_headers]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}. Required: name, aadhaar_number, state, phone"
            )
        
        # Import voters
        imported_count = 0
        errors = []
        
        for index, row in enumerate(reader):
            try:
                voter_state = str(row.get('state', '')).strip()
                aadhaar = str(row.get('aadhaar', '')).strip()
                name = str(row.get('name', '')).strip()
                
                # Check if phone exists in row
                phone = None
                if 'phone' in row:
                    p = str(row.get('phone', '')).strip()
                    if p:
                        phone = p
                
                # Validate state
                if admin_state != "All States" and voter_state != admin_state:
                    errors.append({
                        "row": index + 2,
                        "error": f"State admin can only import voters for {admin_state}"
                    })
                    continue
                
                # Validate Aadhaar number
                if len(aadhaar) != 12 or not aadhaar.isdigit():
                    errors.append({
                        "row": index + 2,
                        "error": f"Invalid Aadhaar number: {aadhaar} (must be 12 digits)"
                    })
                    continue
                
                # Generate unique ID and token
                voter_id = f"VOT{secrets.token_hex(4).upper()}"
                voting_token = secrets.token_hex(32)
                
                voter_data = {
                    'voter_id': voter_id,
                    'voting_token': voting_token,
                    'name': name,
                    'aadhaar': aadhaar,
                    'state': voter_state,
                    'phone': phone
                }
                
                # Register voter using Database wrapper which encrypts
                result = db.register_voter(voter_data)
                
                if result.get("success"):
                    imported_count += 1
                else:
                    errors.append({
                        "row": index + 2,
                        "error": result.get("error", "Unknown database error")
                    })
                    
            except Exception as row_error:
                errors.append({
                    "row": index + 2,
                    "error": str(row_error)
                })
        
        return JSONResponse({
            "success": True,
            "message": f"Import complete: {imported_count} voters imported, {len(errors)} errors found.",
            "imported_count": imported_count,
            "error_count": len(errors),
            "errors": errors[:50]  # Limit returned errors
        })
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"Import error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

'''
    
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(before + new_impl + after)
    print("Patched successfully!")
else:
    print("Could not find start or end index.")
