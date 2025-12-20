# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including Material-UI, Next.js, TypeScript, and utilities.

## Step 2: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and update these values:
- NEXT_PUBLIC_API_URL - Your backend API URL  
- NEXT_PUBLIC_OLLAMA_URL - Your Ollama server URL

## Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser

## Step 4: Build for Production

```bash
npm run build
npm start
```

## Folder Structure

- `src/app/` - All pages (Home, Sermon Prep, Projection, etc.)
- `src/components/` - Reusable components (Sidebar, Layout)
- `src/theme/` - Material-UI theme configuration
- `src/lib/` - Utility functions and API client

## Next Steps

1. Connect to your backend API (see README.md)
2. Implement authentication  
3. Add real data fetching with SWR or React Query
4. Customize theme colors in `src/theme/theme.ts`
5. Add more pages as needed

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

See README.md for full documentation
