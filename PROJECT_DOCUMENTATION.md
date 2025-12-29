# Church Dashboard - Complete Project Documentation

## Overview
The Church Dashboard is a comprehensive church management system with AI-powered features for sermon preparation, Bible study, hymn/song management, document organization, and automated slide generation for church services.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Features](#core-features)
3. [Technical Stack](#technical-stack)
4. [Module Details](#module-details)
5. [Recent Improvements](#recent-improvements)
6. [API Reference](#api-reference)

---

## System Architecture

### Components
- **Frontend:** Next.js 14 with React, TypeScript, and Material-UI
- **Backend:** FastAPI (Python) with async support
- **Database:** PostgreSQL with full-text search
- **Vector Store:** Qdrant for embeddings
- **AI:** Ollama for local LLM processing
- **Search:** Integrated vector and keyword search

### Data Flow
```
User → Next.js Frontend → FastAPI Backend → PostgreSQL Database
                                         → Qdrant Vector Store
                                         → Ollama AI Service
```

---

## Core Features

### 1. Bible Study Module
**Access:** `/bible`

**Features:**
- **8 Bible Versions:** NIV, KJV, ESV, NKJV, NASB, ASV, WEB, YLT
- **Parallel Comparison:** View up to 3 versions side-by-side
- **Full-Text Search:** Search across all versions
- **Verse Navigation:** Easy book/chapter/verse selection
- **Copy & Share:** Quick verse copying
- **Responsive Design:** Works on all devices

**Database:**
- `bible_versions` table: Version metadata
- `bible_text` table: All verses (31,000+ verses per version)
- Indexed for fast searches

### 2. Hymn Library
**Access:** `/hymns`

**Features:**
- **Multiple Hymnals:** Baptist Hymnal, Methodist, Lutheran, etc.
- **Full Lyrics:** Complete hymn text with verse structure
- **Metadata:** Composer, author, themes, scripture references
- **Search:** By title, first line, theme, or scripture
- **CCLI Integration:** Copyright info when available

**Database:**
- `hymns` table with full-text search
- Themes as array for categorization
- Scripture references linked

### 3. Contemporary Songs Library
**Access:** `/library`

**Features:**
- **Modern Worship Songs:** Contemporary Christian music
- **Full Lyrics:** Complete song text
- **Musical Info:** Key signature, tempo, artist
- **CCLI Numbers:** Copyright tracking
- **Theme Tags:** Searchable categories
- **Scripture Links:** Associated verses

**Database:**
- `songs` table with metadata
- Theme-based organization
- Full-text search enabled

### 4. Sermon Preparation (AI-Powered)
**Access:** `/sermon-prep`

**Features:**
- **AI Assistant:** Ollama-powered sermon help
- **Scripture Analysis:** Deep dive into passages
- **Outline Generation:** AI-generated sermon structures
- **Illustration Suggestions:** Relevant examples
- **Cross-References:** Related passages
- **Save & Organize:** Store sermon notes

**Technology:**
- RAG (Retrieval Augmented Generation)
- Vector similarity search
- Context-aware responses
- Local AI processing (privacy-focused)

### 5. Document Management
**Access:** `/documents`

**Features:**
- **File Upload:** PDF, DOCX, TXT, audio files
- **Categorization:** Sermons, notes, recordings, images
- **Full-Text Search:** Search document contents
- **AI Transcription:** Audio to text (Whisper)
- **Metadata:** Author, date, tags
- **Download:** Easy file retrieval

**Categories:**
- Sermons
- Notes
- Audio Recordings
- Images
- Other

### 6. Church Slide Generator
**Access:** `/slides`

**Features:**
- **Google Drive Integration:** Fetch content from Drive
- **Auto-Generation:** Create PowerPoint slides automatically
- **Per-Category Settings:** Different styles for songs, hymns, announcements
- **26 Professional Fonts:** Including Arial Black, Garamond, Impact
- **Text Alignment:** Left, Center, Right, Justify (all working)
- **Vertical Positioning:** Top, Center, Bottom placement
- **Custom Font Sizes:** 12-72pt range
- **Line Control:** 1-20 lines per slide
- **Download Ready:** Direct PowerPoint download

**Settings (Per Category):**
- **Songs:** 6 lines, 38pt, centered
- **Hymns:** 8 lines, 34pt, centered
- **Announcements:** 10 lines, 28pt, centered
- **Uncategorized:** 8 lines, 32pt, centered

**Recent Improvements:**
1. Font library expanded from 14 to 26 fonts
2. Fixed text alignment bugs (right/justify now work)
3. Added vertical positioning (top/center/bottom)
4. All settings persist in database
5. Per-category customization

### 7. Projection System
**Access:** `/projection`

**Features:**
- **Live Display:** Real-time content projection
- **Multiple Modes:** AI-driven, voice-controlled, manual
- **Content Types:** Bible verses, hymns, songs, announcements
- **Clean Interface:** Distraction-free display
- **Session Tracking:** History of displayed content

**Modes:**
- AI-Driven: Automatic content selection
- Voice-Controlled: Speak commands
- Manual: Click-to-display

### 8. Teachings Library
**Access:** Various API endpoints

**Features:**
- **Sermon Archive:** Store past sermons
- **Bible Studies:** Teaching series
- **Devotionals:** Daily readings
- **Tags & Themes:** Organized by topic
- **Scripture Links:** Connected to passages
- **Audio/Video:** Multimedia support

---

## Technical Stack

### Frontend
```json
{
  "framework": "Next.js 14",
  "language": "TypeScript",
  "ui-library": "Material-UI (MUI)",
  "state-management": "React Hooks",
  "styling": "MUI Theme System",
  "api-client": "Fetch API"
}
```

### Backend
```python
{
  "framework": "FastAPI",
  "language": "Python 3.8+",
  "async": "uvicorn/gunicorn",
  "orm": "psycopg2",
  "ai": "Ollama",
  "embeddings": "sentence-transformers",
  "vector-db": "Qdrant"
}
```

### Database Schema
**Main Tables:**
- `users` - User accounts
- `bible_versions` - Bible version metadata
- `bible_text` - All Bible verses
- `hymns` - Hymnal songs
- `songs` - Contemporary worship songs
- `teachings` - Sermon archive
- `sermons` - Sermon preparation
- `slide_preferences` - Slide generation settings
- `projection_sessions` - Projection history
- `user_preferences` - User settings

---

## Module Details

### Bible Module

#### Supported Versions
1. **NIV** - New International Version
2. **KJV** - King James Version
3. **ESV** - English Standard Version
4. **NKJV** - New King James Version
5. **NASB** - New American Standard Bible
6. **ASV** - American Standard Version
7. **WEB** - World English Bible
8. **YLT** - Young's Literal Translation

#### API Endpoints
- `GET /api/bible/versions` - List versions
- `GET /api/bible/{version}/{book}/{chapter}` - Get chapter
- `GET /api/bible/search` - Search verses
- `GET /api/bible/books` - List books

### Hymn Module

#### Database Structure
```sql
hymns (
  id, hymnal, number, title, first_line,
  lyrics, author, composer,
  themes[], scripture_references[]
)
```

#### API Endpoints
- `GET /api/hymns` - List/search hymns
- `GET /api/hymns/{id}` - Get hymn details
- `POST /api/hymns` - Add hymn

### Slide Generator Module

#### Font Library (26 fonts)
**Sans-Serif:** Arial, Arial Black, Arial Narrow, Calibri, Calibri Light, Century Gothic, Franklin Gothic Medium, Lucida Sans Unicode, Segoe UI, Segoe UI Light, Tahoma, Trebuchet MS, Verdana

**Serif:** Cambria, Constantia, Garamond, Georgia, Palatino Linotype, Times New Roman

**Display:** Comic Sans MS, Impact

**Monospace:** Consolas, Courier New, Lucida Console

**Other:** Candara, Corbel

#### Workflow
1. **Configure Service:** Set up Google Drive folder ID
2. **Fetch Content:** Download files from Drive
3. **Customize Settings:** Adjust fonts, sizes, alignment, position
4. **Generate Slides:** Create PowerPoint files
5. **Download:** Get PPTX files ready for presentation

#### Settings Storage
All preferences stored in `slide_preferences` table:
- User-specific settings
- Per-category customization
- Persistent across sessions
- Reset to defaults option

---

## Recent Improvements

### Slide Generator Enhancements (Dec 2025)

#### 1. Font Expansion
- Added 12 new professional fonts
- Total fonts increased from 14 to 26
- Includes Arial Black (highly requested)
- All fonts are Windows/Office standard

#### 2. Text Alignment Fix
- **Bug:** Right alignment showed as center
- **Bug:** Justify alignment showed as left
- **Fix:** Now uses proper PP_ALIGN constants
- **Result:** All 4 alignments work correctly

#### 3. Vertical Positioning
- **New Feature:** Position text at top/center/bottom
- **Per-Category:** Separate control for each type
- **Database:** 4 new vertical_position columns
- **UI:** Dropdown controls in settings dialog

#### Technical Details
```python
# Alignment Fix
from pptx.enum.text import PP_ALIGN
alignment_map = {
    "left": PP_ALIGN.LEFT,
    "center": PP_ALIGN.CENTER,
    "right": PP_ALIGN.RIGHT,
    "justify": PP_ALIGN.JUSTIFY
}

# Vertical Positioning
# MSO_ANCHOR: TOP=1, MIDDLE=3, BOTTOM=4
tf.vertical_anchor = get_vertical_anchor_value(position)
```

---

## API Reference

### Base URL
- Development: `http://localhost:8000`
- Production: `http://your-domain.com`

### Authentication
Currently uses basic user ID (to be enhanced with OAuth)

### Key Endpoints

#### Bible
```
GET  /api/bible/versions
GET  /api/bible/{version}/{book}/{chapter}
GET  /api/bible/search?q=query&version=NIV
```

#### Hymns
```
GET  /api/hymns?search=query
GET  /api/hymns/{id}
```

#### Songs
```
GET  /api/songs?search=query
GET  /api/songs/{id}
```

#### Slides
```
GET  /api/slides/services
POST /api/slides/fetch
POST /api/slides/generate
GET  /api/slides/files
GET  /api/slides/fonts
GET  /api/slides/preferences
POST /api/slides/preferences
```

#### AI/Sermon
```
POST /api/sermon/ask
GET  /api/sermon/context
```

### Response Format
```json
{
  "status": "success",
  "data": {},
  "message": "Operation completed"
}
```

---

## Security Considerations

1. **Database:** PostgreSQL with user authentication
2. **API:** CORS configured for localhost
3. **Files:** Sanitized filenames prevent directory traversal
4. **AI:** Local processing (Ollama) - no data sent to cloud
5. **Passwords:** Hashed (bcrypt ready for implementation)

---

## Performance

- **Database:** Indexed full-text search
- **Caching:** Frontend caches Bible data
- **Async:** FastAPI async endpoints
- **Vector Search:** Qdrant optimized queries
- **Production:** Gunicorn with 4 workers

---

## Future Enhancements

### Planned Features
1. User authentication & roles
2. Multi-church support
3. Mobile app
4. Email notifications
5. Calendar integration
6. Giving/donation tracking
7. Member directory
8. Event management
9. Volunteer scheduling
10. Custom branding per church

### Slide Generator
1. Background colors/images
2. Custom templates
3. Slide transitions
4. Font color selection
5. Bold/italic toggles
6. Line spacing controls
7. Margin adjustments
8. Preview before generation

---

## Support & Maintenance

### Logging
- Backend logs: uvicorn/gunicorn output
- Database logs: PostgreSQL logs
- Application logs: Console and file logging

### Monitoring
- Health check endpoint: `/health`
- Database connection monitoring
- API response time tracking

### Backup
- Database: PostgreSQL backup tools
- Files: Document directory backup
- Configuration: Environment files

---

## License & Credits

**Project:** Church Dashboard
**Purpose:** Church management and ministry tools
**AI Models:** Ollama (open source)
**Fonts:** Windows/Office standard fonts
**Bible Text:** Public domain translations

---

**Last Updated:** December 29, 2025
**Version:** 1.0.0 (Production Ready)
