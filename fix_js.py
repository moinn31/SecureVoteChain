import re

with open('static/voter.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_func = '''async function handleRegister(e) {
    e.preventDefault();
    
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const otp = document.getElementById('otpInput').value;
    
    if (!otp || otp.length !== 6) {
        showMessage('Please enter the 6-digit OTP sent to your email', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/voter/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aadhaar_number: aadhaarNumber,
                otp: otp
            })
        });'''

new_func = '''async function handleRegister(e) {
    e.preventDefault();
    
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const otp = document.getElementById('otpInput').value;
    const state = document.getElementById('voterState').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const fullNameReg = document.getElementById('fullNameReg').value;
    
    if (!otp || otp.length !== 6) {
        showMessage('Please enter the 6-digit OTP sent to your phone', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/voter/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aadhaar_number: aadhaarNumber,
                otp: otp,
                state: state,
                phone: mobileNumber,
                name: fullNameReg
            })
        });'''

if old_func in text:
    text = text.replace(old_func, new_func)
    with open('static/voter.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced handleRegister successfully!")
else:
    print("Could not find exact text for old_func")

