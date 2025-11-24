# Simple Local Development Setup

Since `vercel dev` is having issues, here's the simplest way to develop locally:

## Option 1: Run Vite Only (Simplest)

Just run Vite for local development:

```bash
npm run dev
```

This will start your app at `http://localhost:5173` (or another port if 5173 is taken).

**Note**: API routes (`/api/fetchTopics` and `/api/generateNotes`) won't work locally with this approach, but:
- The frontend will work perfectly
- You can test all UI features
- API routes will work automatically when you deploy to Vercel

## Option 2: Deploy to Vercel and Test There

1. **Push your code to GitHub** (if not already done)

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Import your project from GitHub
   - Add environment variables:
     - `HUGGINGFACE_API_KEY`
     - `TAVILY_API_KEY` (optional)
   - Deploy!

3. **Test everything on the live site** - API routes will work perfectly

## Option 3: Fix Vercel Dev (If you really need local API testing)

1. **Remove the cached config**:
   ```bash
   rm -rf .vercel
   ```

2. **Clear any running processes**:
   - Kill any `vercel dev` processes
   - Kill any `vite` processes

3. **Try again**:
   ```bash
   npx vercel dev
   ```

---

## Recommended: Use Option 1 or 2

For now, just use `npm run dev` to develop the frontend. When you're ready to test the AI features, deploy to Vercel and test there. This is actually the easiest and most reliable approach!
