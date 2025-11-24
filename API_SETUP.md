# AI Features Setup Guide

This guide will help you set up the AI features (topic generation and note generation) that use web search and HuggingFace.

## Prerequisites

1. **HuggingFace API Key** (Required)
   - Sign up at https://huggingface.co/
   - Create an access token at https://huggingface.co/settings/tokens
   - This is required for generating topics and notes
   - Make sure your token has read access

2. **Tavily API Key** (Optional but Recommended)
   - Sign up at https://tavily.com/
   - Get your API key from the dashboard
   - This enables web search for more accurate and up-to-date information

## Environment Variables

You need to set the following environment variables:

### For Local Development

Create a `.env.local` file in the root directory:

```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL_ID=meta-llama/Llama-3.1-8B-Instruct
TAVILY_API_KEY=your_tavily_api_key_here
```

**Note:** The `HUGGINGFACE_MODEL_ID` is optional and defaults to `meta-llama/Llama-3.1-8B-Instruct`. You can change it to any HuggingFace model that supports text generation.

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `HUGGINGFACE_API_KEY` - Your HuggingFace API key (required)
   - `HUGGINGFACE_MODEL_ID` - Model ID (optional, defaults to meta-llama/Llama-3.1-8B-Instruct)
   - `TAVILY_API_KEY` - Your Tavily API key (optional)

## Local Development

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't:
   ```bash
   npm i -g vercel
   ```

2. Run the development server:
   ```bash
   vercel dev
   ```

   This will start both the frontend and API routes locally.

### Option 2: Using Vite Dev Server

1. Start the Vite dev server:
   ```bash
   npm run dev
   ```

2. **Note**: For API routes to work locally, you'll need to either:
   - Use `vercel dev` as shown in Option 1, OR
   - Deploy to Vercel and update `VITE_API_URL` in `.env.local` to point to your deployed API

## Testing the AI Features

1. **Start the application** using one of the methods above
2. **Go to the Knowledge Base page** in your app
3. **Set up your qualification**:
   - Select your qualification level (GCSE, A-Level, etc.)
   - Select your subject
   - Select your exam board
4. **Generate topics**: The AI will search the web and generate a comprehensive list of topics
5. **Generate notes**: Select a topic to generate detailed study notes with practice questions

## Troubleshooting

### CORS Errors
- If you see CORS errors, make sure you're using the API proxy (via Vercel) and not calling external APIs directly from the browser
- The API routes in `/api` directory handle CORS headers automatically

### "API key not configured" Error
- Make sure your environment variables are set correctly
- For local development, ensure `.env.local` exists and contains `HUGGINGFACE_API_KEY`
- For Vercel, ensure environment variables are added in the dashboard

### "Failed to fetch topics" Error
- Check your HuggingFace API key is valid
- The model may be loading (first request can take a moment) - try again after a few seconds
- Check your internet connection
- Try with a different qualification/subject combination
- If you see "model is loading" error, wait 10-30 seconds and try again

### "Model is loading" Error
- HuggingFace models go to sleep after inactivity
- The first request wakes up the model and may take 10-30 seconds
- Simply wait and try again - subsequent requests will be faster

### Web Search Not Working
- Tavily API key is optional - the app will work without it, just without web search
- If you want web search, ensure your Tavily API key is set correctly

## API Endpoints

The following API endpoints are available:

- `POST /api/fetchTopics` - Generates topics for a qualification/subject/exam board
  - Body: `{ qualification, subject, examBoard }`
  - Returns: `{ topics: string[] }`

- `POST /api/generateNotes` - Generates study notes for a topic
  - Body: `{ topic, qualification, subject, examBoard }`
  - Returns: `{ notes: { title, summary, mainPoints, keyTerms, practiceQuestions } }`

## Production Deployment

1. Ensure all environment variables are set in Vercel dashboard
2. Deploy your application to Vercel
3. The API routes will automatically work as Vercel serverless functions

## Notes

- The AI features use HuggingFace's Llama 3.1 8B Instruct model (configurable via `HUGGINGFACE_MODEL_ID`)
- Web search via Tavily provides up-to-date information from official sources
- All API calls are proxied through Vercel serverless functions to avoid CORS issues
- The system will gracefully fall back to AI-only generation if web search fails
- **Important**: The first request to HuggingFace may take 10-30 seconds as the model loads. Subsequent requests are faster.
- You can use any HuggingFace model that supports text generation by changing `HUGGINGFACE_MODEL_ID`
