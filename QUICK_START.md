# Church RAG System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites Check
Ensure all services are running:
- ✅ Docker containers: PostgreSQL, Redis, Qdrant, Ollama
- ✅ Backend: http://localhost:8000/docs
- ✅ Frontend: http://localhost:3001

---

## 🎯 Quick Test Guide

### 1. Bible Study (30 seconds)
```
1. Open: http://localhost:3001/bible
2. Search: "John 3:16" (or any verse)
3. Wait for AI insights to generate
4. Try different Bible versions
```

### 2. Sermon Prep (2 minutes)
```
1. Open: http://localhost:3001/sermon-prep
2. Enter title: "The Power of Love"
3. Enter scripture: "1 Corinthians 13"
4. Click "Get AI Suggestions"
5. Wait 10-30 seconds for AI to generate
6. Click "Insert" to add outline
7. Click "Save Draft"
8. Click "Load" to view saved sermon
```

### 3. Live Projection (1 minute)
```
1. Open: http://localhost:3001/projection
2. Select "Smart Mode"
3. Click "Start Projection Session"
4. Watch for WebSocket connection status
5. Click "Clear Screen" to test
6. Click "Stop Session" when done
```

---

## 📊 What's Working

### ✅ Fully Integrated Features
- **Bible Search**: Real-time verse lookup with AI insights
- **Sermon Management**: Save, load, and AI-assisted outline generation
- **Live Projection**: WebSocket-based real-time display control
- **AI Integration**: Ollama-powered suggestions and insights
- **Database Operations**: PostgreSQL for persistent storage
- **Error Handling**: Comprehensive error messages and loading states

### ⏳ Coming Soon
- User authentication
- Complete Bible data (all books)
- Hymn database
- Cross-reference lookup
- Version comparison
- Commentary integration

---

## 🔍 Verification Commands

### Check Backend
```bash
curl http://localhost:8000/api/bible/search?query=John%203:16&version=NIV
```

### Check Frontend
```bash
curl http://localhost:3001
```

### Check Docker Services
```bash
docker ps | grep -E "postgres|redis|qdrant|ollama"
```

---

## 🐛 Quick Troubleshooting

### Bible Search Returns Empty
```bash
# Load sample Bible data
cd church-rag-backend
python app/scripts/load_sample_bible.py
```

### AI Generation Fails
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Pull model if needed
ollama pull llama3.1:8b
```

### Frontend Can't Connect
```bash
# Check .env.local exists
cat church-rag-frontend/.env.local

# Should contain:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📱 All Available Pages

| Page | URL | Status |
|------|-----|--------|
| Home Dashboard | http://localhost:3001 | ✅ Ready |
| Bible Study | http://localhost:3001/bible | ✅ **Integrated** |
| Sermon Prep | http://localhost:3001/sermon-prep | ✅ **Integrated** |
| Hymns | http://localhost:3001/hymns | 🔨 UI Only |
| Live Projection | http://localhost:3001/projection | ✅ **Integrated** |
| Documents | http://localhost:3001/documents | 🔨 UI Only |
| Library | http://localhost:3001/library | 🔨 UI Only |
| Settings | http://localhost:3001/settings | 🔨 UI Only |

---

## 🎓 Key Features to Demo

### 1. Bible AI Insights
- Search for any verse
- AI automatically generates theological insights
- Themes are extracted and displayed as chips
- Multiple version support

### 2. Smart Sermon Assistant
- Enter scripture reference
- AI generates complete outline
- Get hymn suggestions automatically
- Save and load drafts

### 3. Real-time Projection
- WebSocket connection for live updates
- Three listening modes
- Display preview
- History tracking

---

## 📖 Full Documentation

For complete details, see:
- **INTEGRATION_GUIDE.md** - Full technical documentation
- **Backend API Docs** - http://localhost:8000/docs
- **Setup Instructions** - church-rag-backend/setup.md

---

## ⚡ Performance Notes

- First AI request may take 10-30 seconds (Ollama warm-up)
- Subsequent requests are faster (model cached)
- Bible searches are instant (PostgreSQL)
- WebSocket connections establish in <1 second

---

**Ready to use!** 🎉

Your Church RAG System is fully integrated and operational. Start with the Bible Study page to see the AI in action!
