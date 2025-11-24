# Debug API Key Issues

If you're getting "api key failed all models" errors, check these:

## 1. Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify you have: `HUGGINGFACE_API_KEY` (not `VITE_HUGGINGFACE_API_KEY`)
3. Make sure it starts with `hf_`
4. Make sure it's set for all environments (Production, Preview, Development)

## 2. Test Your API Key

After deploying, visit:
```
https://your-app.vercel.app/api/testApiKey
```

This will show you:
- If the API key is being read
- What error HuggingFace is returning
- The status code

## 3. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on a recent function execution
3. Check the logs for detailed error messages

## 4. Common Issues

**Issue**: API key not found
- Make sure variable name is exactly `HUGGINGFACE_API_KEY`
- Make sure you redeployed after adding it

**Issue**: Authentication failed (401/403)
- Verify your token has read permissions
- Make sure token is not expired
- Try generating a new token

**Issue**: All models return 410
- Some models might not be available
- The fallback system should try other models automatically

## 5. Manual Test

Test your API key directly:

```bash
curl -X POST https://api-inference.huggingface.co/models/gpt2 \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello"}'
```

If this works, the issue is with how we're calling it. If it doesn't, the API key itself has issues.
