#!/bin/bash

# Church Dashboard - Production Build Script
# This script builds both frontend and backend for production deployment

set -e

echo "=================================================="
echo "   Church Dashboard - Production Build"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}Starting production build process...${NC}\n"

# Build Backend
echo -e "${BLUE}[1/2] Building Backend...${NC}"
cd church-rag-backend

echo "  → Installing production dependencies..."
pip install -r requirements.txt gunicorn

echo "  → Verifying database connection..."
python3 -c "from app.core.database import get_db_connection; conn = get_db_connection(); conn.close(); print('Database connection successful')"

echo -e "${GREEN}✓ Backend build complete${NC}\n"

# Build Frontend
echo -e "${BLUE}[2/2] Building Frontend...${NC}"
cd ../church-rag-frontend

echo "  → Installing dependencies..."
npm install

echo "  → Building Next.js application..."
npm run build

if [ -d ".next" ]; then
    echo -e "${GREEN}✓ Frontend build complete${NC}\n"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

cd ..

# Summary
echo "=================================================="
echo -e "${GREEN}   Production Build Complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "  1. Run: chmod +x start_production.sh"
echo "  2. Run: ./start_production.sh"
echo ""
echo "Or to run as a system service:"
echo "  - See SETUP_GUIDE.md for systemd service setup"
echo "=================================================="
