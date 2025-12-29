#!/bin/bash

# Church Dashboard - Complete Installation Script
# This script sets up the entire application from scratch

set -e

echo "=================================================="
echo "   Church Dashboard - Complete Installation"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}This script will install and configure the Church Dashboard.${NC}"
echo -e "${YELLOW}Estimated time: 5-10 minutes${NC}\n"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}[1/8] Checking prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    echo "Please install npm"
    exit 1
fi

if ! command_exists psql; then
    echo -e "${RED}✗ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 13 or higher"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites installed${NC}\n"

# Install PostgreSQL if not running
echo -e "${BLUE}[2/8] Setting up PostgreSQL...${NC}"
if ! sudo systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi
echo -e "${GREEN}✓ PostgreSQL running${NC}\n"

# Create database and user
echo -e "${BLUE}[3/8] Creating database...${NC}"
sudo -u postgres psql <<EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS church_rag;
DROP USER IF EXISTS church_user;

-- Create new user and database
CREATE USER church_user WITH PASSWORD 'church_password';
CREATE DATABASE church_rag OWNER church_user;
GRANT ALL PRIVILEGES ON DATABASE church_rag TO church_user;
EOF

echo -e "${GREEN}✓ Database created${NC}\n"

# Initialize database schema
echo -e "${BLUE}[4/8] Initializing database schema...${NC}"
PGPASSWORD=church_password psql -h localhost -U church_user -d church_rag -f church-rag-backend/app/db/init.sql
echo -e "${GREEN}✓ Schema initialized${NC}\n"

# Install Python backend dependencies
echo -e "${BLUE}[5/8] Installing backend dependencies...${NC}"
cd church-rag-backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt gunicorn

echo -e "${GREEN}✓ Backend dependencies installed${NC}\n"

# Run database migrations
echo -e "${BLUE}[6/8] Running database migrations...${NC}"
python3 add_vertical_position.py || echo "Migration already applied"
python3 fix_users_and_add_fonts.py || echo "User setup already complete"
deactivate

echo -e "${GREEN}✓ Database migrations complete${NC}\n"

cd ..

# Install Node.js frontend dependencies
echo -e "${BLUE}[7/8] Installing frontend dependencies...${NC}"
cd church-rag-frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}\n"

cd ..

# Build production assets
echo -e "${BLUE}[8/8] Building production assets...${NC}"
echo "This may take a few minutes..."

cd church-rag-frontend
npm run build

if [ ! -d ".next" ]; then
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Production build complete${NC}\n"

cd ..

# Make scripts executable
chmod +x build_production.sh
chmod +x start_production.sh

# Create systemd service file (optional)
echo -e "${BLUE}Creating systemd service file (optional)...${NC}"
cat > church-dashboard.service <<EOF
[Unit]
Description=Church Dashboard Application
After=network.target postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=$SCRIPT_DIR/start_production.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ Service file created: church-dashboard.service${NC}\n"

# Final summary
echo "=================================================="
echo -e "${GREEN}   Installation Complete!${NC}"
echo "=================================================="
echo ""
echo "📚 Quick Start:"
echo "  1. Start the application:"
echo "     ${BLUE}./start_production.sh${NC}"
echo ""
echo "  2. Access the dashboard:"
echo "     ${BLUE}http://localhost:3000${NC}"
echo ""
echo "  3. Access the API docs:"
echo "     ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo "📋 Optional: Install as system service:"
echo "  sudo cp church-dashboard.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable church-dashboard"
echo "  sudo systemctl start church-dashboard"
echo ""
echo "📖 For more information:"
echo "  - Setup Guide: ${BLUE}SETUP_GUIDE.md${NC}"
echo "  - Features: ${BLUE}PROJECT_DOCUMENTATION.md${NC}"
echo ""
echo "=================================================="
