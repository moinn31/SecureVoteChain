import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the check logic in import_voters
old_logic = '''                # Register voter using Database wrapper which encrypts
                result = db.register_voter(voter_data)
                
                if result.get("success"):
                    imported_count += 1
                else:
                    errors.append({
                        "row": index + 2,
                        "error": result.get("error", "Unknown database error")
                    })'''

new_logic = '''                # Register voter using Database wrapper which encrypts
                result = db.register_voter(voter_data)
                
                # In JSON db it returns True/False. In Supabase it returns a dict.
                if result is False:
                    errors.append({
                        "row": index + 2,
                        "error": "Voter ID already exists"
                    })
                else:
                    imported_count += 1'''

text = text.replace(old_logic, new_logic)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(text)
