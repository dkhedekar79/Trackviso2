import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, couponId, billingPeriod, trial = false, accessToken } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const isTrial = trial === true;
    let authenticatedUser = null;

    // Trial checkout must be tied to the currently authenticated account so
    // the offer cannot be claimed by submitting another user's ID.
    if (isTrial) {
      const token = accessToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) {
        return res.status(401).json({ error: 'Please sign in again before starting your trial' });
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user || data.user.id !== userId) {
        return res.status(401).json({ error: 'Your session could not be verified' });
      }

      authenticatedUser = data.user;
      const metadata = authenticatedUser.user_metadata || {};
      if (metadata.trial_used === true || metadata.trial_started_at) {
        return res.status(400).json({ error: 'Your free trial has already been used' });
      }
      if (metadata.is_premium === true || metadata.subscription_plan === 'professor') {
        return res.status(400).json({ error: 'Your account already has premium access' });
      }
    }

    // 'yearly' gives 2 months free vs the monthly plan (£4.99 x 12 = £59.88)
    const isYearly = billingPeriod === 'yearly';

    const metadata = {
      userId,
      billingPeriod: isYearly ? 'yearly' : 'monthly',
      trial: isTrial ? 'true' : 'false',
    };

    if (isTrial) {
      metadata.trialDays = '7';
    }

    if (couponId) {
      metadata.couponId = couponId;
    }

    // Create Stripe Checkout Session
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: isTrial
                ? 'Professor Plan — 7-Day Free Trial'
                : isYearly
                  ? 'Professor Plan (Yearly)'
                  : 'Professor Plan (Monthly)',
              description: isTrial
                ? '7 days of unlimited study tools and 1-to-1 support, then your selected plan begins'
                : isYearly
                  ? 'Unlimited Mock Exams and Blurt Tests — 2 months free'
                  : 'Unlimited Mock Exams and Blurt Tests',
            },
            recurring: {
              interval: isYearly ? 'year' : 'month',
            },
            unit_amount: isYearly ? 4999 : 499, // £49.99/year or £4.99/month in pence
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'https://trackviso-beta.vercel.app'}/payment/success?session_id={CHECKOUT_SESSION_ID}${isTrial ? '&trial=true' : ''}`,
      cancel_url: `${process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'https://trackviso-beta.vercel.app'}/payment`,
      client_reference_id: userId,
      customer_email: authenticatedUser?.email,
      metadata,
      subscription_data: {
        metadata,
        ...(isTrial ? { trial_period_days: 7 } : {}),
      },
      ...(isTrial ? { payment_method_collection: 'always' } : {}),
    };

    if (couponId) {
      sessionConfig.discounts = [
        {
          coupon: couponId,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}

