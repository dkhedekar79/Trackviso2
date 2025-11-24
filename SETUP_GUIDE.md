# Complete Setup Guide for AI Features

This guide will walk you through everything you need to set up the AI features (topic generation and note generation) with HuggingFace and web search.

---

## Step 1: Get Your HuggingFace API Key

You mentioned you already have a HuggingFace API key. If you need to find it or create a new one:

1. **Go to HuggingFace**: https://huggingface.co/
2. **Sign in** or create an account
3. **Go to Settings**: Click on your profile → Settings
4. **Navigate to Access Tokens**: https://huggingface.co/settings/tokens
5. **Create a new token** (or use an existing one):
   - Click "New token"
   - Name it (e.g., "Trackviso API")
   - Select "Read" permissions (minimum required)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

**Your HuggingFace API Key will look like**: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 2: Get Your Tavily API Key (Optional but Recommended)

Tavily enables web search to get accurate, up-to-date information from the internet.

### How to Get Tavily API Key:

1. **Go to Tavily**: https://tavily.com/
2. **Sign up** for a free account:
   - Click "Sign Up" or "Get Started"
   - Enter your email and create a password
   - Verify your email if required
3. **Access the Dashboard**:
   - Once logged in, go to your dashboard
   - Navigate to the "API Keys" section
4. **Create an API Key**:
   - Click "Create API Key" or "Generate Key"
   - Give it a name (e.g., "Trackviso")
   - Copy the API key

**Note**: Tavily offers free tier with limited requests. For production, you may need a paid plan, but the free tier is good for testing and small-scale use.

**Your Tavily API Key will look like**: `tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**What Tavily Does**:
- Searches the web for current specification documents
- Finds official syllabus information
- Provides up-to-date educational content
- Makes topic lists and notes more accurate

**If you skip Tavily**: The app will still work, but it won't have web search capabilities and will rely solely on the AI model's training data.

---

## Step 3: Set Up Environment Variables

You need to configure environment variables so your app can access these APIs.

### Option A: Local Development (.env.local file)

1. **Create a file named `.env.local`** in the root directory of your project (same folder as `package.json`)

2. **Add the following content**:
   ```env
   HUGGINGFACE_API_KEY=your_huggingface_key_here
   HUGGINGFACE_MODEL_ID=meta-llama/Llama-3.1-8B-Instruct
   TAVILY_API_KEY=your_tavily_key_here
   ```

3. **Replace the placeholder values**:
   - Replace `your_huggingface_key_here` with your actual HuggingFace API key
   - Replace `your_tavily_key_here` with your actual Tavily API key (or remove this line if you're not using it)
   - The `HUGGINGFACE_MODEL_ID` is optional - it defaults to Llama 3.1 if you don't specify it

**Example**:
   ```env
   HUGGINGFACE_API_KEY=hf_abc123xyz789...
   HUGGINGFACE_MODEL_ID=meta-llama/Llama-3.1-8B-Instruct
   TAVILY_API_KEY=tvly-xyz123abc789...
   ```

4. **Save the file**

**Important**: Never commit `.env.local` to git! It should already be in `.gitignore`.

### Option B: Vercel Deployment (Production)

If you're deploying to Vercel:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings** → **Environment Variables**
4. **Add each variable**:
   - Click "Add New"
   - **Key**: `HUGGINGFACE_API_KEY`
     - **Value**: Your HuggingFace API key
     - **Environments**: Select all (Production, Preview, Development)
   - Click "Add"
   
   - Click "Add New" again
   - **Key**: `TAVILY_API_KEY`
     - **Value**: Your Tavily API key
     - **Environments**: Select all
   - Click "Add"

   - (Optional) Click "Add New"
   - **Key**: `HUGGINGFACE_MODEL_ID`
     - **Value**: `meta-llama/Llama-3.1-8B-Instruct`
     - **Environments**: Select all
   - Click "Add"

5. **Redeploy** your application after adding environment variables

---

## Step 4: Install Vercel CLI (For Local Testing)

To test the API routes locally, you'll need Vercel CLI:

1. **Install Vercel CLI globally**:
   ```bash
   npm install -g vercel
   ```

   Or if you prefer using npx (no installation needed):
   ```bash
   npx vercel dev
   ```

2. **Verify installation**:
   ```bash
   vercel --version
   ```

---

## Step 5: Run the Application

### For Local Development:

**Option 1: Using Vercel CLI (Recommended for API testing)**

```bash
vercel dev
```

This will:
- Start your frontend on a local port (usually http://localhost:3000)
- Make API routes work locally
- Use your `.env.local` file for environment variables

**Option 2: Using Vite (Frontend only)**

```bash
npm run dev
```

**Note**: With this option, API routes won't work locally unless you deploy to Vercel first and point to the deployed API URL.

### For Production:

1. **Push your code to GitHub** (or your git repository)
2. **Deploy to Vercel**:
   - If connected to GitHub: Vercel auto-deploys on push
   - Or use: `vercel --prod`
3. **Make sure environment variables are set** in Vercel dashboard (Step 3B)

---

## Step 6: Test the AI Features

1. **Start your application** (using one of the methods above)

2. **Navigate to the Knowledge Base page** in your app

3. **Set up your qualification**:
   - Click "Configure Now" or "Change" if you see setup info
   - **Step 1**: Select your qualification (GCSE, A-Level, etc.)
   - **Step 2**: Select your subject
   - **Step 3**: Select your exam board
   - Click "Complete Setup"

4. **Wait for topics to generate**:
   - The AI will search the web (if Tavily is configured)
   - Then generate a list of topics
   - **First request may take 10-30 seconds** (HuggingFace model loading)
   - You'll see "Fetching Topics..." with a loading indicator

5. **Select a topic** from the dropdown

6. **View generated notes**:
   - The AI will generate comprehensive study notes
   - Includes main points, key terms, and practice questions
   - This may also take 10-30 seconds on first request

---

## Step 7: Troubleshooting

### ❌ "API key not configured" Error

**Solution**:
- Check that `.env.local` exists and has the correct key names
- Make sure there are no extra spaces around the `=` sign
- For Vercel: Verify environment variables are set in dashboard
- Restart your dev server after adding/changing environment variables

### ❌ "HuggingFace model is loading" Error

**Solution**:
- This is normal! HuggingFace models go to sleep after inactivity
- Wait 10-30 seconds and try again
- The model stays awake for a while after first use
- Subsequent requests will be much faster

### ❌ CORS Errors

**Solution**:
- Make sure you're using the API proxy (via Vercel)
- Don't call HuggingFace API directly from the browser
- The `/api` routes handle CORS automatically

### ❌ "Failed to fetch topics" Error

**Solutions**:
1. Check your HuggingFace API key is valid
2. Check your internet connection
3. Try a different qualification/subject combination
4. Wait longer if it's the first request (model loading)
5. Check the browser console for detailed error messages

### ❌ Web Search Not Working

**Solution**:
- Tavily API key is optional - the app works without it
- If you want web search, verify your Tavily API key is correct
- Check that you have credits/quota left on your Tavily account
- The app will gracefully fall back to AI-only if web search fails

### ❌ Slow Response Times

**Normal Behavior**:
- First request: 10-30 seconds (model loading)
- Subsequent requests: 3-10 seconds
- Web search adds 1-3 seconds
- This is expected with HuggingFace's free inference API

---

## Step 8: Customization (Optional)

### Change the HuggingFace Model

If you want to use a different model:

1. **Find a model** on HuggingFace: https://huggingface.co/models?pipeline_tag=text-generation

2. **Update your environment variable**:
   ```env
   HUGGINGFACE_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.2
   ```

3. **Restart your server**

**Recommended models**:
- `meta-llama/Llama-3.1-8B-Instruct` (current default - good balance)
- `mistralai/Mistral-7B-Instruct-v0.2` (fast and efficient)
- `google/gemma-7b-it` (Google's model)
- `meta-llama/Llama-3.1-70B-Instruct` (larger, slower, more capable)

---

## Checklist

Before you start testing, make sure:

- [ ] HuggingFace API key obtained
- [ ] Tavily API key obtained (optional but recommended)
- [ ] `.env.local` file created with both keys
- [ ] Vercel CLI installed (for local testing)
- [ ] Environment variables set in Vercel dashboard (for production)
- [ ] Application running with `vercel dev` or deployed to Vercel

---

## Quick Reference

**Required Environment Variables**:
```env
HUGGINGFACE_API_KEY=hf_xxxxx
```

**Optional Environment Variables**:
```env
HUGGINGFACE_MODEL_ID=meta-llama/Llama-3.1-8B-Instruct
TAVILY_API_KEY=tvly_xxxxx
```

**Commands**:
```bash
# Local development with API
vercel dev

# Frontend only
npm run dev

# Deploy to production
vercel --prod
```

**Key URLs**:
- HuggingFace Tokens: https://huggingface.co/settings/tokens
- Tavily Signup: https://tavily.com/
- Vercel Dashboard: https://vercel.com/dashboard

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal/command line for API errors
3. Verify all environment variables are set correctly
4. Make sure you're using the latest version of the code
5. Try waiting longer on first request (model loading)

Good luck! 🚀
