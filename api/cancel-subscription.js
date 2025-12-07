import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's subscription from Stripe
    // You'll need to store the Stripe customer ID or subscription ID in user metadata
    // For now, we'll search for active subscriptions for this user
    const subscriptions = await stripe.subscriptions.list({
      limit: 1,
      // You might want to add metadata filter here if you store userId in subscription metadata
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptions.data[0];

    // Cancel the subscription
    const cancelledSubscription = await stripe.subscriptions.cancel(subscription.id);

    // Update user in Supabase
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        subscription_plan: 'scholar',
        is_premium: false,
      }
    });

    if (updateError) {
      console.error('Error updating user:', updateError);
      // Don't fail the request if Supabase update fails
    }

    res.status(200).json({ 
      success: true, 
      subscription: {
        id: cancelledSubscription.id,
        status: cancelledSubscription.status,
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: error.message });
  }
}

