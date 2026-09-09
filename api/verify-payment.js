import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.query?.session_id;
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!sessionId || !token) {
    return res.status(400).json({ success: false, error: 'Session and authentication are required' });
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ success: false, error: 'Your session could not be verified' });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (checkoutSession.client_reference_id !== userData.user.id) {
      return res.status(403).json({ success: false, error: 'This checkout does not belong to your account' });
    }

    const subscription = checkoutSession.subscription;
    const subscriptionStatus = typeof subscription === 'object' ? subscription.status : null;
    const isValidSubscription = checkoutSession.mode === 'subscription' && (
      checkoutSession.status === 'complete' ||
      subscriptionStatus === 'active' ||
      subscriptionStatus === 'trialing'
    );

    if (!isValidSubscription) {
      return res.status(400).json({ success: false, error: 'Checkout has not completed' });
    }

    return res.status(200).json({
      success: true,
      trial: checkoutSession.metadata?.trial === 'true' || subscriptionStatus === 'trialing',
      status: subscriptionStatus || checkoutSession.status,
    });
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return res.status(500).json({ success: false, error: 'Unable to verify checkout session' });
  }
}
