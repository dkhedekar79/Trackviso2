import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function updateUserSubscription(userId, plan, metadata = {}) {
  try {
    // Update user metadata in Supabase Auth. Keep unrelated profile metadata intact.
    const { data: existingUserData, error: existingUserError } = await supabase.auth.admin.getUserById(userId);
    if (existingUserError) throw existingUserError;

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(existingUserData.user?.user_metadata || {}),
        ...metadata,
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

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.error('Webhook missing stripe-signature header');
    return res.status(400).send('Missing stripe-signature');
  }

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error('Failed to read webhook body:', err.message);
    return res.status(400).send('Invalid body');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
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
          const isTrial = session.metadata?.trial === 'true';
          const trialStartedAt = isTrial ? new Date().toISOString() : undefined;
          const trialEndsAt = isTrial
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            : undefined;

          await updateUserSubscription(userId, 'professor', {
            ...(isTrial ? {
              trial_used: true,
              trial_started_at: trialStartedAt,
              trial_ends_at: trialEndsAt,
              trial_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
            } : {}),
          });
          console.log(`${isTrial ? 'Trial started' : 'Subscription activated'} for user: ${userId}`);
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
        if ((subscription.status === 'active' || subscription.status === 'trialing') && userId) {
          const isTrial = subscription.status === 'trialing' || subscription.metadata?.trial === 'true';
          await updateUserSubscription(userId, 'professor', {
            ...(isTrial ? {
              trial_used: true,
              trial_started_at: subscription.trial_start
                ? new Date(subscription.trial_start * 1000).toISOString()
                : undefined,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : undefined,
              trial_subscription_id: subscription.id,
            } : {}),
          });
          console.log(`Subscription updated for user: ${userId}`);
        } else if (subscription.status !== 'active' && userId) {
          // Trial expiry, cancellation, or an unpaid subscription removes premium access.
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

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// For Vercel, we need to handle raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

