# Stripe Backend Setup Guide

## Overview
This guide will help you set up the Stripe backend for handling payments and subscriptions.

## Files Created

1. **`/api/create-checkout-session.js`** - Creates Stripe checkout sessions
2. **`/api/webhook.js`** - Handles Stripe webhook events
3. **`/api/verify-payment.js`** - Verifies payment after checkout
4. **`/api/cancel-subscription.js`** - Cancels user subscriptions

## Setup Steps

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. For webhooks, you'll need a **Webhook signing secret** (see step 4)

### 2. Set Environment Variables

#### Local Development (.env.local)

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL (for local development)
FRONTEND_URL=http://localhost:5173
VITE_FRONTEND_URL=http://localhost:5173

# Supabase (for webhook to update user subscriptions)
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Vercel Production

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all the variables above (use production Stripe keys for production)

### 3. Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set the endpoint URL:
   - **Local testing**: Use Stripe CLI (see below)
   - **Production**: `https://yourdomain.com/api/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Local Webhook Testing (Optional)

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Login and forward webhooks:
```bash
stripe login
stripe listen --forward-to localhost:5173/api/webhook
```

This will give you a webhook signing secret starting with `whsec_` - use this for local development.

### 5. Update Supabase Service Role Key

The webhook needs a Supabase service role key to update user metadata. 

1. Go to your Supabase project
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key - this has admin privileges)
4. Add it to your environment variables as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT**: Never expose the service role key in client-side code!

### 6. Test the Integration

1. **Test Checkout Flow**:
   - Go to `/payment` page
   - Click "Proceed to Payment"
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date and any CVC
   - Complete the checkout

2. **Verify Webhook**:
   - Check Stripe Dashboard → **Webhooks** → **Events** to see if webhook was received
   - Check your user's subscription status in Supabase

3. **Test Payment Success Page**:
   - After successful payment, you should be redirected to `/payment/success`
   - Your subscription should be updated to "professor" plan

## Production Checklist

- [ ] Replace test keys with live keys in Vercel
- [ ] Set up production webhook endpoint in Stripe
- [ ] Add production webhook secret to Vercel
- [ ] Test complete payment flow in production
- [ ] Set up email notifications for failed payments (optional)
- [ ] Monitor webhook events in Stripe Dashboard

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook endpoint URL is correct
2. Verify webhook secret matches
3. Check Vercel function logs for errors
4. Ensure webhook events are selected in Stripe Dashboard

### User Subscription Not Updating

1. Check Supabase service role key is correct
2. Verify user ID is being passed correctly
3. Check Vercel function logs for errors
4. Manually verify user metadata in Supabase

### Payment Verification Failing

1. Check session ID is being passed correctly
2. Verify Stripe secret key is correct
3. Check API route is accessible
4. Review browser console for errors

## Security Notes

- Never commit `.env.local` or environment variables to git
- Use service role key only in server-side code (API routes)
- Always verify webhook signatures
- Use HTTPS in production
- Regularly rotate API keys

## Support

For Stripe-specific issues, check:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

