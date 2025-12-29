@echo off
REM Church Dashboard - Windows Start Script
REM Double-click this file to start the application

title Church Dashboard

echo ==================================================
echo    Church Dashboard - Starting Application
echo ==================================================
echo.

REM Start PostgreSQL service
echo [1/3] Starting PostgreSQL...
net start postgresql-x64-13 >nul 2>&1
if errorlevel 1 (
    echo Warning: PostgreSQL may already be running or needs manual start
) else (
    echo [OK] PostgreSQL started
)

REM Start Backend
echo.
echo [2/3] Starting Backend Server...
cd church-rag-backend
start "Church Dashboard - Backend" cmd /k "venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
cd ..

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo.
echo [3/3] Starting Frontend Server...
cd church-rag-frontend
start "Church Dashboard - Frontend" cmd /k "npm run start"
cd ..

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Open browser
echo.
echo ==================================================
echo    Church Dashboard is RUNNING!
echo ==================================================
echo.
echo Opening browser...
start http://localhost:3000

echo.
echo Access Points:
echo   Dashboard:  http://localhost:3000
echo   API Docs:   http://localhost:8000/docs
echo.
echo To stop: Close the Backend and Frontend terminal windows
echo.
echo This window will close in 10 seconds...
timeout /t 10

exit
