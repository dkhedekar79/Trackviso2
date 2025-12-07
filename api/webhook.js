import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function updateUserSubscription(userId, plan) {
  try {
    // Update user metadata in Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        subscription_plan: plan,
        is_premium: plan === 'professor',
      }
    });

    if (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserSubscription:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Construct the event from the request body and signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (userId) {
          await updateUserSubscription(userId, 'professor');
          console.log(`Subscription activated for user: ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateUserSubscription(userId, 'scholar');
          console.log(`Subscription cancelled for user: ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        // If subscription is active, ensure user is on professor plan
        if (subscription.status === 'active' && userId) {
          await updateUserSubscription(userId, 'professor');
          console.log(`Subscription updated for user: ${userId}`);
        } else if (subscription.status !== 'active' && userId) {
          // If subscription is not active, downgrade to scholar
          await updateUserSubscription(userId, 'scholar');
          console.log(`Subscription deactivated for user: ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Payment failed for subscription:', invoice.subscription);
        // You might want to send an email notification here
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const userId = invoice.metadata?.userId;
        
        if (userId) {
          // Ensure subscription is active after successful payment
          await updateUserSubscription(userId, 'professor');
          console.log(`Payment succeeded for user: ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// For Vercel, we need to handle raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

