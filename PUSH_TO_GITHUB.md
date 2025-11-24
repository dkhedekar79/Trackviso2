# How to Push to GitHub

Follow these steps to push your code to GitHub:

## Step 1: Initialize Git Repository

```bash
git init
```

## Step 2: Add All Files

```bash
git add .
```

## Step 3: Make Your First Commit

```bash
git commit -m "Initial commit: Trackviso app with AI features"
```

## Step 4: Create a GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Sign in** to your account (or create one if you don't have one)
3. **Click the "+" icon** in the top right → "New repository"
4. **Fill in the details**:
   - Repository name: `Trackviso` (or any name you want)
   - Description: "Gamified study tracker with AI-powered notes"
   - Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README" (we already have code)
   - Click **"Create repository"**

## Step 5: Connect Your Local Repository to GitHub

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 6: Push Your Code

```bash
git branch -M main
git push -u origin main
```

You may be asked to sign in to GitHub. Follow the prompts.

---

## Quick Command Reference

Copy and paste these commands one by one:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Trackviso app with AI features"

# 4. Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

---

## Important Notes

✅ **Your `.env.local` file is already ignored** - your API keys won't be committed  
✅ **All sensitive files are protected** by `.gitignore`  
✅ **After pushing, you can deploy to Vercel** from GitHub

---

## After Pushing

Once your code is on GitHub:

1. **Go to Vercel**: https://vercel.com
2. **Click "Add New..." → "Project"**
3. **Import from GitHub** - select your repository
4. **Configure**:
   - Framework Preset: **Vite**
   - Root Directory: `./` (default)
5. **Add Environment Variables**:
   - `HUGGINGFACE_API_KEY` = your key
   - `TAVILY_API_KEY` = your key (optional)
6. **Click "Deploy"**

Your app will be live in minutes! 🚀

---

## Troubleshooting

### "Permission denied" error?
- Make sure you're signed into GitHub
- Check your repository URL is correct

### "Repository not found" error?
- Verify the repository name is correct
- Make sure you created the repository on GitHub first

### Need to update the remote URL?
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```
