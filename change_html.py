import re

with open('templates/voter.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Add Full Name and Mobile Number to Register Form
old_html = '''                    <div class="form-group">
                        <label data-translate="aadhaarNumber">Aadhaar Number (12 digits) *</label>
                        <input type="text" id="aadhaarNumber" data-translate="enterAadhaar" placeholder="Enter Aadhaar number" maxlength="12" required>
                    </div>'''

new_html = '''                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" id="fullNameReg" placeholder="Enter full name" required>
                    </div>
                    <div class="form-group">
                        <label data-translate="aadhaarNumber">Aadhaar Number (12 digits) *</label>
                        <input type="text" id="aadhaarNumber" data-translate="enterAadhaar" placeholder="Enter Aadhaar number" maxlength="12" minlength="12" required>
                    </div>
                    <div class="form-group">
                        <label>Mobile Number *</label>
                        <input type="tel" id="mobileNumber" placeholder="Enter mobile number" maxlength="15" required>
                    </div>'''

text = text.replace(old_html, new_html)

with open('templates/voter.html', 'w', encoding='utf-8') as f:
    f.write(text)
