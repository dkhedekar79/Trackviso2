# HuggingFace Model Setup Guide

If you're getting 410 "Gone" errors for all models, here's how to fix it:

## The Problem

HuggingFace's free Inference API has limited model availability. Many models return 410 errors because:
1. They're not available on the free tier
2. They require accepting terms of service
3. They need special access permissions

## Solution 1: Accept Model Terms (Most Important!)

Many models require you to accept their terms before use:

1. **Go to the model page on HuggingFace**:
   - For gpt2: https://huggingface.co/gpt2
   - For distilgpt2: https://huggingface.co/distilgpt2
   - Or search for any model you want to use

2. **Accept the model terms**:
   - Scroll down on the model page
   - Click "Agree and access repository" if you see it
   - This might be required even for free models

3. **Try again** - the model should now work

## Solution 2: Use a Model That Definitely Works

Set this in Vercel → Environment Variables:
- `HUGGINGFACE_MODEL_ID` = `gpt2`

The `gpt2` model should work without any special access.

## Solution 3: Test Your Setup

After deploying, visit:
```
https://your-app.vercel.app/api/testApiKey
```

This will show you:
- If your API key is being read
- If gpt2 is working
- What error you're getting

## Solution 4: Check HuggingFace Account Status

1. Go to: https://huggingface.co/settings/billing
2. Check if you have any restrictions on your account
3. Make sure your account is verified

## Solution 5: Use a Different Model

If models keep failing, try setting a specific working model:

In Vercel → Environment Variables:
- `HUGGINGFACE_MODEL_ID` = `distilgpt2`

Or try these models that should work:
- `gpt2`
- `distilgpt2`
- `sshleifer/tiny-gpt2`

## Current Status

The app now has a **fallback system** - if HuggingFace fails, it will show example topics so the app still works. But for real AI-generated topics, you need to fix the HuggingFace setup above.

## Quick Checklist

- [ ] API key is set in Vercel as `HUGGINGFACE_API_KEY`
- [ ] API key starts with `hf_`
- [ ] Accepted terms for gpt2 model: https://huggingface.co/gpt2
- [ ] Tested with `/api/testApiKey` endpoint
- [ ] Redeployed after making changes
