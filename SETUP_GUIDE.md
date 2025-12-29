# Church Dashboard - Complete Setup Guide

## Quick Start (Recommended)

For a complete automated installation, run:

```bash
chmod +x install_complete.sh
./install_complete.sh
```

This script handles everything automatically. Continue reading for manual setup or troubleshooting.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Automated Installation](#automated-installation)
3. [Manual Installation](#manual-installation)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Prerequisites

### Required Software
- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 13+** ([Download](https://www.postgresql.org/download/))
- **Git** (for cloning repository)

### Optional (For AI Features)
- **Ollama** ([Install](https://ollama.ai/)) - For AI sermon preparation
- **Qdrant** - Vector database for RAG

### System Requirements
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB for application, 10GB+ for AI models
- **OS:** Linux (Ubuntu/Debian), macOS, or Windows with WSL

---

## Automated Installation

### Option 1: Complete Fresh Install

```bash
# Make script executable
chmod +x install_complete.sh

# Run installation
./install_complete.sh
```

**What it does:**
1. Checks all prerequisites
2. Sets up PostgreSQL database
3. Installs Python dependencies
4. Installs Node.js dependencies
5. Runs database migrations
6. Builds production assets
7. Creates systemd service file

**Duration:** 5-10 minutes

### Option 2: Production Build Only

If already installed, rebuild for production:

```bash
chmod +x build_production.sh
./build_production.sh
```

---

## Manual Installation

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd church-dashboard
```

### Step 2: Database Setup

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER church_user WITH PASSWORD 'church_password';
CREATE DATABASE church_rag OWNER church_user;
GRANT ALL PRIVILEGES ON DATABASE church_rag TO church_user;
EOF

# Initialize schema
PGPASSWORD=church_password psql -h localhost -U church_user -d church_rag -f church-rag-backend/app/db/init.sql
```

### Step 3: Backend Setup

```bash
cd church-rag-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt gunicorn

# Run migrations
python3 add_vertical_position.py
python3 fix_users_and_add_fonts.py

deactivate
cd ..
```

### Step 4: Frontend Setup

```bash
cd church-rag-frontend

# Install dependencies
npm install

# Build for production
npm run build

cd ..
```

### Step 5: Verify Installation

```bash
# Check database
PGPASSWORD=church_password psql -h localhost -U church_user -d church_rag -c "\dt"

# Check frontend build
ls -la church-rag-frontend/.next

# Check backend
cd church-rag-backend
source venv/bin/activate
python3 -c "from app.core.database import get_db_connection; conn = get_db_connection(); print('✓ Backend OK')"
deactivate
cd ..
```

---

## Production Deployment

### Starting the Application

```bash
# Make script executable (first time only)
chmod +x start_production.sh

# Start application
./start_production.sh
```

**Access:**
- **Dashboard:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

Press `Ctrl+C` to stop.

### Running as System Service

For production servers, install as a systemd service:

```bash
# Copy service file
sudo cp church-dashboard.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable church-dashboard

# Start service
sudo systemctl start church-dashboard

# Check status
sudo systemctl status church-dashboard
```

**Service Commands:**
```bash
# Start
sudo systemctl start church-dashboard

# Stop
sudo systemctl stop church-dashboard

# Restart
sudo systemctl restart church-dashboard

# View logs
sudo journalctl -u church-dashboard -f
```

### Environment Variables

Create `.env` file in project root:

```env
# Database
POSTGRES_DB=church_rag
POSTGRES_USER=church_user
POSTGRES_PASSWORD=church_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Application
NODE_ENV=production
PORT=3000
API_URL=http://localhost:8000

# Optional: AI Features
OLLAMA_HOST=http://localhost:11434
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

---

## Configuration

### Database Configuration

**Connection String:**
```
postgresql://church_user:church_password@localhost:5432/church_rag
```

**Backup Database:**
```bash
pg_dump -h localhost -U church_user church_rag > backup.sql
```

**Restore Database:**
```bash
PGPASSWORD=church_password psql -h localhost -U church_user church_rag < backup.sql
```

### Google Drive Integration (Slide Generator)

1. Create Google Cloud Project
2. Enable Google Drive API
3. Create Service Account
4. Download `credentials.json`
5. Place in `church-rag-backend/slide_content/`
6. Share Drive folders with service account email

**Service Configuration:**
Edit `church-rag-backend/slide_content/services.json`:

```json
{
  "services": [
    {
      "name": "08AM",
      "start_time": "08:00",
      "drive_folder_id": "your-folder-id-here"
    },
    {
      "name": "11AM",
      "start_time": "11:00",
      "drive_folder_id": "your-folder-id-here"
    }
  ]
}
```

### AI Configuration (Optional)

**Install Ollama:**
```bash
curl https://ollama.ai/install.sh | sh
```

**Pull AI Model:**
```bash
ollama pull llama2
```

**Install Qdrant:**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

---

## Troubleshooting

### Database Connection Issues

**Problem:** Can't connect to database

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if user exists
sudo -u postgres psql -c "\du"

# Verify connection
PGPASSWORD=church_password psql -h localhost -U church_user -d church_rag -c "SELECT 1"
```

### Frontend Build Failures

**Problem:** `npm run build` fails

**Solution:**
```bash
# Clear cache and rebuild
cd church-rag-frontend
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Backend Import Errors

**Problem:** Module not found errors

**Solution:**
```bash
cd church-rag-backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### Port Already in Use

**Problem:** Port 3000 or 8000 already in use

**Solution:**
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill process
kill -9 <PID>
```

### Permission Errors

**Problem:** Permission denied errors

**Solution:**
```bash
# Make scripts executable
chmod +x *.sh

# Fix ownership
sudo chown -R $USER:$USER .

# Fix PostgreSQL permissions
sudo -u postgres psql -c "GRANT ALL ON DATABASE church_rag TO church_user"
```

### Slide Generator Issues

**Problem:** Slides not generating

**Checklist:**
1. ✓ credentials.json exists in slide_content/
2. ✓ Service account has access to Drive folders
3. ✓ drive_folder_id is correct in services.json
4. ✓ python-pptx is installed: `pip install python-pptx`
5. ✓ Database has slide_preferences table

---

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Update backend
cd church-rag-backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Update frontend
cd church-rag-frontend
npm install
npm run build
cd ..

# Restart service
sudo systemctl restart church-dashboard
```

### Database Backup Schedule

**Daily Backup Script:**
```bash
#!/bin/bash
# save as /usr/local/bin/backup-church-db.sh

BACKUP_DIR="/var/backups/church-dashboard"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U church_user church_rag | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

**Add to crontab:**
```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-church-db.sh
```

### Monitor Logs

**Backend logs:**
```bash
# If running as service
sudo journalctl -u church-dashboard -f

# If running manually
tail -f church-rag-backend/logs/app.log
```

**Database logs:**
```bash
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

### Performance Tuning

**PostgreSQL:**
```sql
-- Analyze tables
ANALYZE;

-- Reindex
REINDEX DATABASE church_rag;

-- Vacuum
VACUUM ANALYZE;
```

**Frontend:**
```bash
# Analyze bundle size
cd church-rag-frontend
npm run build
# Check .next/analyze report
```

---

## Security Hardening

### Production Checklist

- [ ] Change default database password
- [ ] Enable PostgreSQL SSL
- [ ] Set up firewall rules
- [ ] Enable HTTPS with SSL certificate
- [ ] Implement rate limiting
- [ ] Enable authentication
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup encryption
- [ ] Environment variable protection

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

---

## Development Setup

For development (not production):

```bash
# Backend (Terminal 1)
cd church-rag-backend
source venv/bin/activate
python3 -m uvicorn app.main:app --reload --port 8000

# Frontend (Terminal 2)
cd church-rag-frontend
npm run dev
```

Access at http://localhost:3000

---

## Additional Resources

### Scripts Reference

- **install_complete.sh** - Full automated installation
- **build_production.sh** - Build production assets
- **start_production.sh** - Start production server
- **check_system_status.sh** - System health check

### Documentation Files

- **PROJECT_DOCUMENTATION.md** - Complete feature documentation
- **SETUP_GUIDE.md** - This file
- **FONT_UPDATE.md** - Slide generator font details
- **SLIDES_IMPROVEMENTS_SUMMARY.md** - Recent improvements
- **API_ENDPOINTS.md** - API reference

### Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review PROJECT_DOCUMENTATION.md
3. Check GitHub issues (if applicable)
4. Review application logs

---

## Success Checklist

After installation, verify:

- [ ] Database is running: `sudo systemctl status postgresql`
- [ ] Backend responds: `curl http://localhost:8000/health`
- [ ] Frontend loads: Open http://localhost:3000
- [ ] Can access Bible page
- [ ] Can access Hymns page
- [ ] Can access Slides page
- [ ] API docs load: http://localhost:8000/docs

---

**Installation Support:**  
If you encounter issues, ensure all prerequisites are installed and all steps completed in order.

**Last Updated:** December 29, 2025  
**Version:** 1.0.0 (Production Ready)
