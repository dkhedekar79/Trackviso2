# Fix 404 Errors for Vite Files

The 404 errors indicate that `vercel dev` isn't properly serving your Vite dev server files. Here's how to fix it:

## Solution 1: Restart Vercel Dev (Recommended)

1. **Stop the current `vercel dev` process** (press `Ctrl+C` in the terminal)

2. **Restart it**:
   ```bash
   npx vercel dev
   ```

3. **When it asks**, make sure to:
   - Select your framework: **Vite** (or "Other" if Vite isn't listed)
   - When asked about dev command, say **Yes** to use `npm run dev`

## Solution 2: Run Vite and Vercel Separately (Alternative)

If Solution 1 doesn't work, run them in separate terminals:

**Terminal 1** - Run Vite dev server:
```bash
npm run dev
```

**Terminal 2** - Run Vercel dev (for API routes):
```bash
npx vercel dev --listen 3000
```

Then access your app at the Vite port (usually `http://localhost:5173`)

## Solution 3: Use Vite Only (For Now)

If you just want to test the frontend without API routes:

```bash
npm run dev
```

The API routes will work when deployed to Vercel, but won't work locally with this approach.

---

## Quick Fix Steps:

1. **Stop `vercel dev`** (Ctrl+C)
2. **Run again**: `npx vercel dev`
3. **Make sure it detects Vite** when prompted
4. **Refresh your browser**

Try Solution 1 first - it's the simplest!
