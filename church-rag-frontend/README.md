# Church RAG System - Ministry Assistant Dashboard

A modern, AI-powered ministry assistant built with Next.js, TypeScript, and Material-UI for sermon preparation, Bible study, hymn management, and live projection.

## Features

- **Dashboard Home** - Overview of ministry activities and quick actions
- **Sermon Preparation** - AI-assisted sermon writing with outline generation
- **Bible Study** - Multi-version Bible with cross-references and commentary
- **Hymn Repository** - Searchable hymn database with theme-based suggestions
- **Live Projection** - Real-time audio detection and verse projection
- **Document Management** - Personal and church-wide content library
- **Multi-user Support** - Personalized experience for each pastor

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: React Hooks
- **API Client**: Axios
- **Icons**: Material Icons

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend API server (Python FastAPI recommended)
- GPU server with Ollama for AI features
- Redis for caching (optional but recommended)

## Installation

1. **Clone or extract the project**
   ```bash
   cd church-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set:
   ```
   NEXT_PUBLIC_API_URL=http://your-gpu-server:8000
   NEXT_PUBLIC_OLLAMA_URL=http://your-gpu-server:11434
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to http://localhost:3000

## Project Structure

```
church-dashboard/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx           # Home dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── sermon-prep/       # Sermon preparation
│   │   ├── bible/             # Bible study
│   │   ├── projection/        # Live projection
│   │   ├── hymns/             # Hymn repository
│   │   ├── documents/         # Document management
│   │   ├── library/           # Church library
│   │   └── settings/          # User settings
│   ├── components/
│   │   └── layout/
│   │       ├── MainLayout.tsx # Main app layout
│   │       └── Sidebar.tsx    # Navigation sidebar
│   ├── theme/
│   │   ├── theme.ts           # MUI theme config
│   │   └── ThemeRegistry.tsx  # Theme provider
│   └── lib/
│       └── api.ts             # API client utilities
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── next.config.js
```

## Backend Integration

This frontend connects to a Python FastAPI backend. See the main architecture documentation for backend setup instructions.

### API Endpoints Expected

- `POST /api/generate` - AI text generation
- `GET /api/bible/search` - Bible verse search
- `GET /api/hymns/search` - Hymn search
- `POST /api/sermon/save` - Save sermon draft
- `POST /api/projection/start` - Start projection session

## Customization

### Theme Customization

Edit `src/theme/theme.ts` to change colors, fonts, and styles:

```typescript
primary: {
  main: '#2C5F7C',  // Change primary color
},
```

### Adding New Pages

1. Create new directory in `src/app/`
2. Add `page.tsx` file
3. Update navigation in `src/components/layout/Sidebar.tsx`

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t church-dashboard .
docker run -p 3000:3000 church-dashboard
```

### Traditional Server
```bash
npm run build
# Copy .next folder and dependencies to server
# Run: node .next/standalone/server.js
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000 |
| `NEXT_PUBLIC_OLLAMA_URL` | Ollama server URL | http://localhost:11434 |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 |

## Features to Implement

This is a starter dashboard. You'll need to add:

1. **Authentication** - User login and JWT tokens
2. **API Integration** - Connect to your backend endpoints
3. **Real-time Features** - WebSocket for live projection
4. **Data Fetching** - Use SWR or React Query for data management
5. **Form Validation** - Add Zod schemas and react-hook-form
6. **Error Handling** - Add error boundaries and toast notifications

## Contributing

This is a ministry project. Contributions welcome!

## License

MIT License - Feel free to use and modify for your church

## Support

For questions or issues:
- Check the architecture documentation
- Review the backend setup guide
- Open an issue on GitHub

## Acknowledgments

Built for pastors and ministry leaders to enhance sermon preparation and church services through AI technology.
