import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const { userId, couponId, billingPeriod } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 'yearly' gives 2 months free vs the monthly plan (£4.99 x 12 = £59.88)
    const isYearly = billingPeriod === 'yearly';

    const metadata = {
      userId: userId,
      billingPeriod: isYearly ? 'yearly' : 'monthly',
    };

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
              name: isYearly ? 'Professor Plan (Yearly)' : 'Professor Plan (Monthly)',
              description: isYearly
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
      success_url: `${process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'https://trackviso-beta.vercel.app'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'https://trackviso-beta.vercel.app'}/payment`,
      client_reference_id: userId,
      metadata,
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

