with open('static/voter.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace requestOtp
old_req = '''async function requestOtp() {
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    
    if (aadhaarNumber.length !== 12) {
        showMessage('Aadhaar number must be 12 digits', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/voter/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaar_number: aadhaarNumber })
        });'''

new_req = '''async function requestOtp() {
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const fullNameReg = document.getElementById('fullNameReg').value;
    
    if (!fullNameReg) {
        showMessage('Full name is required', 'error');
        return;
    }
    if (aadhaarNumber.length !== 12) {
        showMessage('Aadhaar number must be 12 digits', 'error');
        return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
        showMessage('Valid mobile number is required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/voter/request-otp-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaar_number: aadhaarNumber, phone: mobileNumber, name: fullNameReg })
        });'''

text = text.replace(old_req, new_req)

# Replace handleRegister
old_reg = '''async function handleRegister(e) {
    e.preventDefault();
    
    const state = document.getElementById('voterState').value;
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const otp = document.getElementById('otpInput').value;
    
    try {
        const response = await fetch('/api/voter/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                state: state,
                aadhaar_number: aadhaarNumber,
                otp: otp
            })
        });'''

new_reg = '''async function handleRegister(e) {
    e.preventDefault();
    
    const state = document.getElementById('voterState').value;
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const otp = document.getElementById('otpInput').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const fullNameReg = document.getElementById('fullNameReg').value;
    
    try {
        const response = await fetch('/api/voter/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                state: state,
                aadhaar_number: aadhaarNumber,
                otp: otp,
                phone: mobileNumber,
                name: fullNameReg
            })
        });'''

text = text.replace(old_reg, new_reg)

with open('static/voter.js', 'w', encoding='utf-8') as f:
    f.write(text)
