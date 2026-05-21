@echo off
chcp 65001 >nul 2>&1
setlocal

echo ============================================================
echo   SecureVoteChain - Blockchain E-Voting System
echo ============================================================
echo.
echo  Server: http://localhost:5000
echo  Admin:  http://localhost:5000/admin
echo  Voter:  http://localhost:5000/voter
echo  Verify: http://localhost:5000/verify
echo  Stats:  http://localhost:5000/statistics
echo  API:    http://localhost:5000/docs
echo.
echo ============================================================
echo.

:: Set UTF-8 encoding to prevent emoji/unicode errors
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

:: Move to the directory containing this .bat file
cd /d "%~dp0"

:: Prefer .venv, fall back to venv, fall back to system python
if exist "%~dp0.venv\Scripts\python.exe" (
    echo [OK] Using virtual environment (.venv)
    echo.
    "%~dp0.venv\Scripts\python.exe" main.py
) else if exist "%~dp0venv\Scripts\python.exe" (
    echo [OK] Using virtual environment (venv)
    echo.
    "%~dp0venv\Scripts\python.exe" main.py
) else (
    echo [INFO] No virtual environment found, using system Python
    echo [INFO] Tip: Create venv with: python -m venv .venv
    echo.
    python main.py
)

echo.
echo Server stopped.
pause
