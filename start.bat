@echo off
setlocal

set ROOT=%~dp0
set BACKEND_DIR=%ROOT%healthcare-system\backend
set FRONTEND_DIR=%ROOT%healthcare-system\frontend

echo ============================================
echo   MediCare Healthcare System - Starting...
echo ============================================
echo.

echo [1/3] Starting PostgreSQL service...
net start postgresql-x64-17 >nul 2>&1
echo       (ok if it says "already started" - that's normal)
echo.

echo [2/3] Starting Backend (Django) on http://127.0.0.1:8000 ...
start "Healthcare Backend" cmd /k "cd /d "%BACKEND_DIR%" && venv\Scripts\python.exe manage.py runserver"

echo [3/3] Starting Frontend (Vite) on http://localhost:5173 ...
start "Healthcare Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo Waiting for servers to warm up...
timeout /t 6 /nobreak >nul

set BRAVE_PATH="C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
if not exist %BRAVE_PATH% set BRAVE_PATH="C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe"
if not exist %BRAVE_PATH% set BRAVE_PATH="%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"

if exist %BRAVE_PATH% (
    start "" %BRAVE_PATH% "http://localhost:5173"
) else (
    echo Brave not found, opening in default browser...
    start "" "http://localhost:5173"
)

echo.
echo ============================================
echo   All services launched in separate windows.
echo   Backend  : http://127.0.0.1:8000
echo   Frontend : http://localhost:5173
echo   Close those windows to stop the servers.
echo ============================================

endlocal
