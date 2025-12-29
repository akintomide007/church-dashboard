# Frontend-Backend Connection Status Report

**Generated:** December 29, 2025  
**Project:** Church Dashboard  
**Purpose:** Document all frontend-backend API connections and identify issues

---

## Executive Summary

✅ **Overall Status:** Functional but Inconsistent  
⚠️ **Critical Issues:** 4 pages using direct fetch instead of centralized API library  
📊 **Total Pages Analyzed:** 8  
🔗 **Total API Endpoints Used:** 50+

---

## Connection Analysis by Page

### 1. ✅ Home Page (`/`)
**Status:** GOOD - Uses centralized API library

**Backend Connections:**
- ✅ `bibleAPI.getVersions()` → `/api/bible/versions`
- ✅ `hymnAPI.search('')` → `/api/hymns/search`
- ✅ `songsAPI.search('')` → `/api/songs/search`
- ✅ `teachingsAPI.list(20, 0)` → `/api/teachings/list`

**Issues:** None  
**Recommendation:** Good implementation - use as reference for other pages

---

### 2. ✅ Bible Study Page (`/bible`)
**Status:** GOOD - Uses centralized API library

**Backend Connections:**
- ✅ `bibleAPI.search(query, version)` → `/api/bible/search`
- ✅ `aiAPI.generate(prompt)` → `/api/ai/generate`

**Issues:** None  
**Features:**
- Real-time Bible verse search
- AI-powered theological insights
- Multiple version support (KJV, NIV, ESV, NKJV, NASB)

---

### 3. ⚠️ Hymns Page (`/hymns`)
**Status:** FUNCTIONAL BUT INCONSISTENT

**Backend Connections:**
- ⚠️ Direct fetch: `http://localhost:8000/api/hymns/search?query=` (should use `hymnAPI.search()`)

**Issues:**
1. **Uses direct fetch instead of api.ts library** - bypasses authentication interceptors
2. **Hardcoded localhost URL** - won't work in production without env variables
3. **Missing API library usage** - hymnAPI is available but not used

**Recommendation:** Replace direct fetch with:
```typescript
import { hymnAPI } from '@/lib/api';
const data = await hymnAPI.search(query);
```

---

### 4. ⚠️ Library Page (`/library`)
**Status:** FUNCTIONAL BUT INCONSISTENT

**Backend Connections:**
- ⚠️ Direct fetch: `http://localhost:8000/api/teachings/list` (should use `teachingsAPI.list()`)
- ⚠️ Direct fetch: `http://localhost:8000/api/teachings/search?query=` (should use `teachingsAPI.search()`)

**Issues:**
1. **Uses direct fetch instead of api.ts library**
2. **Hardcoded localhost URL**
3. **teachingsAPI available but not used**

**Recommendation:** Replace direct fetch with:
```typescript
import { teachingsAPI } from '@/lib/api';
const data = await teachingsAPI.list(limit, offset);
const searchData = await teachingsAPI.search(query);
```

---

### 5. ⚠️ Documents Page (`/documents`)
**Status:** FUNCTIONAL BUT INCONSISTENT

**Backend Connections:**
- ⚠️ Direct fetch: `http://localhost:8000/api/documents/folders`
- ⚠️ Direct fetch: `http://localhost:8000/api/documents/files`
- ⚠️ Direct fetch: `http://localhost:8000/api/documents/upload` (POST)
- ⚠️ Direct fetch: `http://localhost:8000/api/documents/delete/{folder}/{name}` (DELETE)
- ⚠️ Direct fetch: `http://localhost:8000/api/documents/download/{folder}/{name}`
- ⚠️ Direct fetch: `http://localhost:8000/api/documents/search?query=`

**Issues:**
1. **Uses direct fetch for all operations**
2. **Hardcoded localhost URL**
3. **documentsAPI available but not used**
4. **Missing endpoints in api.ts:** `folders` endpoint not defined

**Recommendation:** 
1. Use documentsAPI from api.ts
2. Add missing `folders` endpoint to api.ts:
```typescript
getFolders: async () => {
  const response = await api.get('/api/documents/folders');
  return response.data;
}
```

---

### 6. ⚠️ Slides Page (`/slides`)
**Status:** FUNCTIONAL BUT INCONSISTENT

**Backend Connections:**
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/services`
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/files`
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/preferences?user_id=1`
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/preferences` (POST)
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/preferences/reset?user_id=1` (POST)
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/fetch` (POST)
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/generate` (POST)
- ❌ Direct fetch: `http://localhost:8000/api/slides/fonts` - **MISSING BACKEND ENDPOINT**
- ⚠️ Direct fetch: `http://localhost:8000/api/slides/download/{filename}`

**Issues:**
1. **Uses direct fetch for all operations**
2. **Hardcoded localhost URL**
3. **slidesAPI available but not used**
4. **CRITICAL:** `/api/slides/fonts` endpoint called but doesn't exist in backend
5. **Missing endpoints in api.ts:** `fonts` and `download` endpoints not defined

**Recommendation:**
1. Use slidesAPI from api.ts for all operations
2. Add missing backend endpoint for fonts (or remove frontend call)
3. Add missing endpoints to api.ts:
```typescript
getFonts: async () => {
  const response = await api.get('/api/slides/fonts');
  return response.data;
},
download: async (filename: string) => {
  const response = await api.get(`/api/slides/download/${filename}`, {
    responseType: 'blob'
  });
  return response.data;
}
```

---

### 7. ✅ Sermon Prep Page (`/sermon-prep`)
**Status:** GOOD - Uses centralized API library

**Backend Connections:**
- ✅ `sermonAPI.save()` → `/api/sermon/save`
- ✅ `sermonAPI.list(20)` → `/api/sermon/list`
- ✅ `sermonAPI.get(id)` → `/api/sermon/{id}`
- ✅ `aiAPI.generateOutline()` → `/api/ai/outline-generator`
- ✅ `aiAPI.getHymnSuggestions()` → `/api/ai/hymn-suggestions`

**Issues:** None  
**Features:**
- AI-powered sermon outline generation
- Hymn suggestions based on scripture
- Draft saving and loading

---

### 8. ✅ Projection Page (`/projection`)
**Status:** GOOD - Uses centralized API library

**Backend Connections:**
- ✅ `projectionAPI.start(mode)` → `/api/projection/start`
- ✅ `projectionAPI.stop()` → `/api/projection/stop`
- ✅ `projectionAPI.getHistory(10)` → `/api/projection/history`
- ✅ WebSocket: `ws://localhost:8000/api/projection/ws`

**Issues:** None  
**Features:**
- Real-time projection control
- WebSocket-based live updates
- Audio detection integration
- Projection history tracking

---

## Centralized API Library (`src/lib/api.ts`)

### ✅ APIs Defined:
1. **bibleAPI** - Bible search, verses, chapters, versions
2. **sermonAPI** - Save, list, get, delete sermons
3. **hymnAPI** - Search hymns, get by theme
4. **projectionAPI** - Start/stop sessions, display content, history
5. **songsAPI** - Search, list, get by artist/theme
6. **teachingsAPI** - Search, list, get by type/tag/teacher
7. **slidesAPI** - Services, files, fetch, generate, preferences
8. **documentsAPI** - List, upload, delete, transcribe
9. **aiAPI** - Generate text, RAG queries, sermon/hymn suggestions, outline generation

### Authentication Features:
- ✅ Automatic token injection (Bearer token)
- ✅ 401 redirect to login on unauthorized
- ✅ Centralized error handling

---

## Backend API Endpoints (Verified)

### `/api/bible` ✅
- GET `/search` - Search verses
- GET `/verse/{book}/{chapter}/{verse}` - Get specific verse
- GET `/chapter/{book}/{chapter}` - Get chapter
- GET `/versions` - List Bible versions

### `/api/sermon` ✅
- POST `/save` - Save sermon
- GET `/list` - List sermons
- GET `/{id}` - Get sermon by ID
- DELETE `/{id}` - Delete sermon

### `/api/hymns` ✅
- GET `/search` - Search hymns
- GET `/{id}` - Get hymn by ID
- GET `/by-theme/{theme}` - Get hymns by theme

### `/api/teachings` ✅
- GET `/search` - Search teachings
- GET `/list` - List teachings
- GET `/{id}` - Get teaching by ID
- GET `/by-type/{type}` - Get by type
- GET `/by-tag/{tag}` - Get by tag
- GET `/by-teacher/{teacher}` - Get by teacher

### `/api/songs` ✅
- GET `/search` - Search songs
- GET `/list` - List songs
- GET `/{id}` - Get song by ID
- GET `/by-artist/{artist}` - Get by artist
- GET `/by-theme/{theme}` - Get by theme
- GET `/themes` - List all themes

### `/api/documents` ✅
- GET `/list` - List documents
- POST `/upload` - Upload document
- DELETE `/delete` - Delete document
- POST `/transcribe` - Transcribe audio
- ❓ GET `/folders` - **May be missing** (used by frontend)
- ❓ GET `/files` - **May be missing** (used by frontend)

### `/api/slides` ✅
- GET `/services` - Get service list
- GET `/files` - Get generated files
- POST `/fetch` - Fetch from Google Drive
- POST `/generate` - Generate slides
- GET `/preferences` - Get user preferences
- POST `/preferences` - Save preferences
- POST `/preferences/reset` - Reset to defaults
- ❌ GET `/fonts` - **MISSING** (called by frontend)
- ❓ GET `/download/{filename}` - **May be missing** (used by frontend)

### `/api/projection` ✅
- POST `/start` - Start projection session
- POST `/stop` - Stop projection session
- GET `/status` - Get session status
- POST `/display` - Display content
- GET `/history` - Get projection history
- WebSocket `/ws` - Real-time updates

### `/api/ai` ✅
- POST `/generate` - Generate text with LLM
- POST `/rag-query` - RAG-enhanced query
- POST `/sermon-suggestions` - Get sermon suggestions
- POST `/hymn-suggestions` - Get hymn suggestions
- POST `/outline-generator` - Generate sermon outline

---

## Critical Issues Summary

### 🔴 High Priority
1. **Missing Backend Endpoint:** `/api/slides/fonts` is called by frontend but doesn't exist
2. **Inconsistent API Usage:** 4 pages bypass centralized API library (Hymns, Library, Documents, Slides)
3. **Hardcoded URLs:** Pages using direct fetch have hardcoded `localhost:8000` which breaks in production

### 🟡 Medium Priority
4. **Missing API Definitions:** `folders` and `files` endpoints for documents not in api.ts
5. **Missing API Definitions:** `fonts` and `download` endpoints for slides not in api.ts
6. **No Error Handling:** Direct fetch calls lack the error handling from api.ts interceptors

### 🟢 Low Priority
7. **Code Duplication:** Error handling duplicated across pages using direct fetch
8. **Inconsistent Patterns:** Mix of API library and direct fetch creates maintenance issues

---

## Recommendations

### Immediate Actions
1. **Add missing backend endpoint** for `/api/slides/fonts` or remove frontend call
2. **Refactor Hymns page** to use `hymnAPI` from api.ts
3. **Refactor Library page** to use `teachingsAPI` from api.ts
4. **Refactor Documents page** to use `documentsAPI` from api.ts (add missing endpoints first)
5. **Refactor Slides page** to use `slidesAPI` from api.ts (add missing endpoints first)

### API Library Enhancements
Add missing endpoints to `api.ts`:

```typescript
// Documents API additions
export const documentsAPI = {
  // ... existing methods ...
  
  getFolders: async () => {
    const response = await api.get('/api/documents/folders');
    return response.data;
  },
  
  getFiles: async () => {
    const response = await api.get('/api/documents/files');
    return response.data;
  },
};

// Slides API additions
export const slidesAPI = {
  // ... existing methods ...
  
  getFonts: async () => {
    const response = await api.get('/api/slides/fonts');
    return response.data;
  },
  
  download: async (filename: string) => {
    const response = await api.get(`/api/slides/download/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
```

### Backend Additions
Add missing endpoints to backend:

```python
# app/api/slides.py
@router.get("/fonts")
async def get_available_fonts():
    """Return list of available fonts for slide generation"""
    return ["Arial", "Calibri", "Times New Roman", "Georgia", "Verdana"]

@router.get("/download/{filename}")
async def download_slide(filename: str):
    """Download generated PowerPoint file"""
    file_path = Path(settings.SLIDE_OUTPUT_DIR) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)
```

---

## Testing Checklist

### Frontend-Backend Integration Tests
- [ ] Test home page stats loading
- [ ] Test Bible search functionality
- [ ] Test hymn search and display
- [ ] Test teaching/library search
- [ ] Test document upload and management
- [ ] Test slide generation workflow
- [ ] Test sermon prep save/load
- [ ] Test projection session start/stop
- [ ] Test WebSocket connection for projection
- [ ] Test AI-powered features (outline, suggestions)

### API Endpoint Tests
- [ ] Verify all endpoints return expected data structure
- [ ] Test authentication token passing
- [ ] Test error handling for 401/403/404/500 errors
- [ ] Test CORS configuration
- [ ] Verify environment variable usage (not hardcoded URLs)

---

## Conclusion

The Church Dashboard has a **functional frontend-backend connection system**, but suffers from **inconsistent implementation patterns**. The centralized API library (`api.ts`) is well-designed with authentication and error handling, but only 4 out of 8 pages actually use it. The other 4 pages use direct fetch calls with hardcoded URLs, which creates maintenance issues and breaks production deployment.

**Priority Actions:**
1. Fix missing `/api/slides/fonts` endpoint
2. Refactor 4 pages to use centralized API library
3. Add missing API definitions
4. Test all endpoints thoroughly before production

**Estimated Effort:** 4-6 hours to refactor and test all connections

---

*Report generated by analyzing all frontend pages and backend API files*
