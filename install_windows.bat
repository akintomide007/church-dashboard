@echo off
REM Church Dashboard - Windows Installation Script
REM This script sets up the entire application on Windows

echo ==================================================
echo    Church Dashboard - Windows Installation
echo ==================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this script as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Checking prerequisites...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed
    echo Please download from https://python.org
    pause
    exit /b 1
)
echo [OK] Python installed

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please download from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js installed

REM Check PostgreSQL
psql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PostgreSQL is not installed
    echo Please download from https://postgresql.org
    pause
    exit /b 1
)
echo [OK] PostgreSQL installed

echo.
echo ==================================================
echo [1/5] Setting up PostgreSQL database...
echo ==================================================

REM Start PostgreSQL service
net start postgresql-x64-13 >nul 2>&1
if errorlevel 1 (
    echo Warning: Could not start PostgreSQL service
    echo You may need to start it manually from Services
)

REM Create database and user
echo Creating database and user...
set PGPASSWORD=postgres
psql -U postgres -c "DROP DATABASE IF EXISTS church_rag;" 2>nul
psql -U postgres -c "DROP USER IF EXISTS church_user;" 2>nul
psql -U postgres -c "CREATE USER church_user WITH PASSWORD 'church_password';"
psql -U postgres -c "CREATE DATABASE church_rag OWNER church_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE church_rag TO church_user;"

echo Initializing database schema...
set PGPASSWORD=church_password
psql -h localhost -U church_user -d church_rag -f church-rag-backend\app\db\init.sql

if errorlevel 1 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)
echo [OK] Database setup complete

echo.
echo ==================================================
echo [2/5] Installing backend dependencies...
echo ==================================================

cd church-rag-backend

REM Create virtual environment
if exist venv (
    rmdir /s /q venv
)
python -m venv venv

REM Activate and install
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

echo.
echo ==================================================
echo [3/5] Running database migrations...
echo ==================================================

python add_vertical_position.py
python fix_users_and_add_fonts.py

call venv\Scripts\deactivate.bat
cd ..

echo [OK] Migrations complete

echo.
echo ==================================================
echo [4/5] Installing frontend dependencies...
echo ==================================================

cd church-rag-frontend
call npm install

if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

echo.
echo ==================================================
echo [5/5] Building production assets...
echo ==================================================

echo This may take a few minutes...
call npm run build

if errorlevel 1 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)
echo [OK] Frontend build complete

cd ..

echo.
echo ==================================================
echo    Installation Complete!
echo ==================================================
echo.
echo Next steps:
echo   1. Double-click: start_windows.bat
echo   2. Open browser to: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
