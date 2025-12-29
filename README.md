# Church Dashboard

A comprehensive church management system with AI-powered features for sermon preparation, Bible study, hymn/song management, document organization, and automated slide generation.

## 🚀 Quick Start

### Automated Installation (Recommended)

```bash
chmod +x install_complete.sh
./install_complete.sh
```

This single command installs everything you need and builds for production!

### Start Application

```bash
./start_production.sh
```

Then open your browser to:
- **Dashboard:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

## 📋 Features

### Core Modules

1. **📖 Bible Study**
   - 8 Bible versions (NIV, KJV, ESV, NKJV, NASB, ASV, WEB, YLT)
   - Parallel comparison (up to 3 versions)
   - Full-text search
   - Easy verse navigation

2. **🎵 Hymn & Song Library**
   - Multiple hymnals
   - Contemporary worship songs
   - Full lyrics and metadata
   - CCLI integration
   - Theme-based search

3. **✨ AI-Powered Sermon Preparation**
   - Local AI assistant (Ollama)
   - Scripture analysis
   - Outline generation
   - Cross-references
   - RAG technology

4. **📁 Document Management**
   - Upload PDFs, DOCX, audio files
   - AI transcription (Whisper)
   - Full-text search
   - Organized categories

5. **🎬 Church Slide Generator** ⭐ NEW FEATURES
   - Google Drive integration
   - Automatic PowerPoint generation
   - **26 professional fonts** (including Arial Black)
   - **Text alignment:** Left, Center, Right, Justify (all fixed!)
   - **Vertical positioning:** Top, Center, Bottom
   - Per-category customization
   - Download-ready presentations

6. **📺 Projection System**
   - Live display
   - AI-driven, voice, or manual control
   - Clean interface
   - Session tracking

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 + TypeScript + Material-UI
- **Backend:** FastAPI (Python) + PostgreSQL
- **AI:** Ollama (local LLM)
- **Search:** Qdrant vector database
- **Slides:** python-pptx

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete installation & configuration guide
- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Full feature documentation
- **[SLIDES_IMPROVEMENTS_SUMMARY.md](SLIDES_IMPROVEMENTS_SUMMARY.md)** - Recent slide generator improvements
- **[FONT_UPDATE.md](FONT_UPDATE.md)** - Font library details

## 🎯 System Requirements

### Required
- Python 3.8+
- Node.js 18+
- PostgreSQL 13+
- 4GB RAM (8GB recommended)

### Optional (For AI Features)
- Ollama (for sermon AI)
- Qdrant (for vector search)

## 📦 Installation Options

### Option 1: Automated (Recommended)
```bash
./install_complete.sh    # Complete installation
./start_production.sh    # Start application
```

### Option 2: Manual
See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed manual installation steps.

### Option 3: Development Mode
```bash
# Backend
cd church-rag-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd church-rag-frontend
npm run dev
```

## 🔧 Configuration

### Database Setup
```bash
# Automatically done by install_complete.sh
# Or manually:
sudo -u postgres psql
CREATE USER church_user WITH PASSWORD 'church_password';
CREATE DATABASE church_rag OWNER church_user;
```

### Google Drive (Slide Generator)
1. Create Google Cloud Project
2. Enable Drive API
3. Create Service Account
4. Download credentials.json
5. Place in `church-rag-backend/slide_content/`
6. Configure folder IDs in `services.json`

## 🎨 Recent Improvements

### Slide Generator (December 2025)

**Font Expansion:**
- 26 professional fonts (was 14)
- Added Arial Black, Garamond, Impact, Segoe UI, and more

**Bug Fixes:**
- Fixed right alignment (was showing as center)
- Fixed justify alignment (was showing as left)
- Now uses proper PowerPoint alignment constants

**New Features:**
- Vertical positioning: Top, Center, Bottom
- Per-category settings for all content types
- All settings persist in database

## 🚢 Production Deployment

### As System Service
```bash
sudo cp church-dashboard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable church-dashboard
sudo systemctl start church-dashboard
```

### Service Management
```bash
sudo systemctl status church-dashboard  # Check status
sudo systemctl restart church-dashboard # Restart
sudo journalctl -u church-dashboard -f  # View logs
```

## 🔐 Security

- PostgreSQL with authentication
- Local AI processing (no cloud data)
- File sanitization
- CORS configured
- Ready for OAuth implementation

## 📊 API Endpoints

Key endpoints:
- `GET /api/bible/versions` - List Bible versions
- `GET /api/hymns` - Search hymns
- `GET /api/songs` - Search songs
- `POST /api/slides/generate` - Generate slides
- `POST /api/sermon/ask` - AI sermon help

Full API documentation: http://localhost:8000/docs

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
sudo systemctl start postgresql
PGPASSWORD=church_password psql -h localhost -U church_user -d church_rag -c "SELECT 1"
```

**Port Already in Use:**
```bash
sudo lsof -i :3000  # Find process
kill -9 <PID>       # Kill it
```

**Frontend Build Failed:**
```bash
cd church-rag-frontend
rm -rf .next node_modules
npm install
npm run build
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more troubleshooting help.

## 📈 Performance

- **Database:** Indexed full-text search
- **Production:** Gunicorn with 4 workers
- **Frontend:** Optimized Next.js build
- **Vector Search:** Qdrant optimized queries

## 🔄 Updates

```bash
git pull
./build_production.sh
sudo systemctl restart church-dashboard
```

## 🗺️ Project Structure

```
church-dashboard/
├── church-rag-backend/      # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── core/           # Config & database
│   │   └── db/             # Database schema
│   └── slide_content/      # Slide generator files
├── church-rag-frontend/     # Next.js frontend
│   └── src/
│       ├── app/            # Pages & routes
│       ├── components/     # React components
│       └── lib/            # Utilities
├── install_complete.sh     # Automated installation
├── build_production.sh     # Production build
├── start_production.sh     # Start servers
└── Documentation files
```

## 🎓 Learning Resources

- **FastAPI:** https://fastapi.tiangolo.com/
- **Next.js:** https://nextjs.org/docs
- **Ollama:** https://ollama.ai/
- **python-pptx:** https://python-pptx.readthedocs.io/

## 🤝 Contributing

This is a church management tool. Contributions welcome for:
- Bug fixes
- Feature enhancements
- Documentation improvements
- Translation support

## 📝 License

Open source project for church ministry use.

## 🙏 Acknowledgments

- **Bible Texts:** Public domain translations
- **Fonts:** Windows/Office standard fonts
- **AI Models:** Ollama open source
- **Community:** Church tech enthusiasts

## 💬 Support

For help:
1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting
2. Review [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
3. Check application logs
4. Review API documentation at `/docs`

## 🎯 Success Checklist

After installation:
- [ ] PostgreSQL running
- [ ] Backend responds at :8000
- [ ] Frontend loads at :3000
- [ ] Can view Bible page
- [ ] Can search hymns
- [ ] Can access slide generator
- [ ] API docs accessible

---

**Version:** 1.0.0 (Production Ready)  
**Last Updated:** December 29, 2025  
**Status:** ✅ Ready for Production Use

🚀 **Get Started:** `./install_complete.sh`
