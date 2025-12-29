#!/bin/bash

# Church Dashboard - Production Startup Script
# This script starts both frontend and backend in production mode

set -e

echo "=================================================="
echo "   Church Dashboard - Production Startup"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if production build exists
if [ ! -d "church-rag-frontend/.next" ]; then
    echo -e "${RED}Production build not found!${NC}"
    echo "Please run ./build_production.sh first"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start PostgreSQL if not running
echo -e "${BLUE}[1/3] Checking PostgreSQL...${NC}"
if ! sudo systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Start Backend (Production mode with gunicorn)
echo -e "\n${BLUE}[2/3] Starting Backend (Production)...${NC}"
cd church-rag-backend

# Check if gunicorn is installed
if ! pip list | grep -q gunicorn; then
    echo "Installing gunicorn..."
    pip install gunicorn
fi

# Start backend with gunicorn (4 workers)
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    &

BACKEND_PID=$!
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Backend failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend running on http://localhost:8000${NC}"

# Start Frontend (Production mode)
echo -e "\n${BLUE}[3/3] Starting Frontend (Production)...${NC}"
cd ../church-rag-frontend

# Start Next.js in production mode
npm run start &

FRONTEND_PID=$!
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Frontend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓ Frontend running on http://localhost:3000${NC}"

# Display status
echo ""
echo "=================================================="
echo -e "${GREEN}   Church Dashboard is RUNNING!${NC}"
echo "=================================================="
echo ""
echo "Access the application at:"
echo -e "  ${BLUE}http://localhost:3000${NC}"
echo ""
echo "Backend API available at:"
echo -e "  ${BLUE}http://localhost:8000${NC}"
echo "  ${BLUE}http://localhost:8000/docs${NC} (API Documentation)"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Wait for processes
wait
