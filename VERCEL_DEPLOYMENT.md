# Vercel Deployment Guide - Stripe Integration

## Step-by-Step Production Deployment

### Step 1: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **Live mode** (toggle in top right)
3. Navigate to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_live_`)
5. Copy your **Secret key** (starts with `sk_live_`) - Click "Reveal" to see it
6. Save both keys securely

### Step 2: Set Up Stripe Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://trackviso-beta.vercel.app/api/webhook`
4. Click **Select events**
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`) - Click "Reveal" to see it
8. Save this secret securely

### Step 3: Get Your Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Find **Project API keys**
5. Copy the **service_role** key (NOT the anon key)
   - ⚠️ This key has admin privileges - keep it secret!
6. Save this key securely

### Step 4: Get Your Supabase URL

1. In the same Supabase API settings page
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Save this URL

### Step 5: Deploy to Vercel

1. Push your code to GitHub (if not already done):
   ```bash
   git add .
   git commit -m "Add Stripe integration"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your GitHub repository (or select existing project)
4. Vercel will auto-detect your project settings

### Step 6: Add Environment Variables in Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add each of these variables (click "Add" for each):

   **Stripe Keys:**
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your Stripe secret key (`sk_live_...`)
   - Environment: Production, Preview, Development (select all)

   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: Your webhook signing secret (`whsec_...`)
   - Environment: Production, Preview, Development (select all)

   **Frontend URL:**
   - Name: `VITE_FRONTEND_URL`
   - Value: `https://trackviso-beta.vercel.app`
   - Environment: Production, Preview, Development (select all)

   - Name: `FRONTEND_URL`
   - Value: `https://trackviso-beta.vercel.app`
   - Environment: Production, Preview, Development (select all)

   **Supabase:**
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL (`https://xxxxx.supabase.co`)
   - Environment: Production, Preview, Development (select all)

   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your Supabase service_role key
   - Environment: Production, Preview, Development (select all)

3. After adding all variables, click **Save**

### Step 7: Redeploy Your Application

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment:
   ```bash
   git commit --allow-empty -m "Trigger deployment with environment variables"
   git push origin main
   ```

### Step 8: Verify Webhook is Working

1. After deployment completes, go to Stripe Dashboard → **Webhooks**
2. Click on your webhook endpoint
3. You should see recent events (may take a few minutes)
4. Test by making a test purchase:
   - Go to your site: `https://trackviso-beta.vercel.app/payment`
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date (e.g., 12/25)
   - Any CVC (e.g., 123)
   - Complete checkout
5. Check Stripe Dashboard → **Webhooks** → **Events** to see if webhook was received
6. Check your user's subscription status in Supabase

### Step 9: Test Production Flow

1. Visit: `https://trackviso-beta.vercel.app/payment`
2. Click "Proceed to Payment"
3. Complete checkout with test card
4. You should be redirected to `/payment/success`
5. Verify your subscription was updated in Supabase

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct: `https://trackviso-beta.vercel.app/api/webhook`
2. Verify `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
3. Check Vercel function logs: **Deployments** → Click deployment → **Functions** tab
4. Ensure webhook events are selected in Stripe Dashboard

### Payment Not Updating Subscription

1. Check `SUPABASE_SERVICE_ROLE_KEY` is correct (service_role, not anon key)
2. Verify `VITE_SUPABASE_URL` is correct
3. Check Vercel function logs for errors
4. Verify user ID is being passed correctly

### API Routes Not Working

1. Ensure all environment variables are set in Vercel
2. Check that variables are set for **Production** environment
3. Redeploy after adding environment variables
4. Check Vercel function logs for specific errors

## Important Notes

- ✅ Use **Live mode** keys in production (keys starting with `pk_live_` and `sk_live_`)
- ✅ Never commit environment variables to git
- ✅ The service_role key has admin access - keep it secret
- ✅ Test with Stripe test cards first before going fully live
- ✅ Monitor webhook events in Stripe Dashboard regularly

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check Stripe Dashboard → Webhooks → Events for errors
3. Verify all environment variables are set correctly
4. Ensure webhook endpoint URL matches your Vercel domain

