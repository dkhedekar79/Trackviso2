# Quick Start Guide - Skip Global Installation!

You don't need to install Vercel globally! Use `npx` instead.

## Option 1: Use npx (No Installation Needed) ✅

Just run this command in your project directory:

```bash
npx vercel dev
```

This will:
- Download Vercel CLI temporarily (no global install needed)
- Start your app with API routes working
- Use your `.env.local` file automatically

**First time it runs**, it might ask you to log in to Vercel - just follow the prompts.

---

## Option 2: Fix npm Permissions (If You Want Global Install)

If you still want to install globally, fix the permissions first:

1. **Run this command** (it will ask for your password):
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

2. **Then try installing again**:
   ```bash
   npm install -g vercel
   ```

---

## Option 3: Just Deploy to Vercel (No Local Testing)

If you just want to deploy and test on Vercel:

1. **Push your code to GitHub** (if not already done)
2. **Go to Vercel**: https://vercel.com
3. **Import your project** from GitHub
4. **Add environment variables** in Vercel dashboard:
   - `HUGGINGFACE_API_KEY`
   - `TAVILY_API_KEY` (optional)
5. **Deploy!**

---

## Recommended: Use Option 1 (npx)

It's the easiest and avoids all permission issues. Just run:

```bash
npx vercel dev
```

That's it! No global install needed. 🎉
