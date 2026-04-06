@echo off
echo ========================================
echo  SecureVoteChain - Starting Server
echo ========================================
echo.
echo Server will run on http://localhost:5000
echo Frontend: http://localhost:3000 (if applicable)
echo Backend: http://localhost:5000
echo.
echo CORS configured for localhost only (NOT 0.0.0.0)
echo.

cd /d "%~dp0"
if exist "%~dp0.venv\Scripts\python.exe" (
	"%~dp0.venv\Scripts\python.exe" main.py
) else (
	"%~dp0venv\Scripts\python.exe" main.py
)

pause
