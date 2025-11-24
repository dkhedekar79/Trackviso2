# Fix npm Cache Permissions

Your npm cache has permission issues. Here's how to fix it:

## Quick Fix (Run in Terminal)

Run this command in your terminal - it will ask for your password:

```bash
sudo chown -R $(whoami) ~/.npm
```

**Enter your password** when prompted (Daiwik2011 or !Daiwik2011)

This will fix the ownership of all npm cache files.

## Alternative: Clear npm Cache

If the above doesn't work, try clearing the cache completely:

```bash
npm cache clean --force
```

Then fix permissions:
```bash
sudo chown -R $(whoami) ~/.npm
```

## After Fixing

Once permissions are fixed, you can:

1. **Use npx (recommended)**:
   ```bash
   npx vercel dev
   ```

2. **Or install globally**:
   ```bash
   npm install -g vercel
   ```

---

## If You Can't Fix Permissions

You can still use the app! Just:

1. **Deploy directly to Vercel** (no local testing needed)
2. **Set environment variables** in Vercel dashboard
3. **Test on the deployed version**

The API routes will work the same way in production!
