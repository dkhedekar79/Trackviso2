# Stripe Integration Guide

## Overview
This guide explains how to integrate Stripe payment processing for the premium subscription model.

## Current Setup
- **Free Plan (Scholar)**: 1 Mock Exam and 1 Blurt Test per day
- **Premium Plan (Professor)**: £4.99/month - Unlimited Mock Exams and Blurt Tests

## Implementation Steps

### 1. Install Stripe Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Backend Setup (Node.js/Express Example)

Create a backend endpoint to handle Stripe checkout session creation:

```javascript
// server/routes/stripe.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Professor Plan',
              description: 'Unlimited Mock Exams and Blurt Tests',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: 499, // £4.99 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler for subscription events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update user subscription in Supabase
      await updateUserSubscription(session.client_reference_id, 'professor');
      break;
    
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Cancel user subscription in Supabase
      await updateUserSubscription(subscription.metadata.userId, 'scholar');
      break;
    
    case 'invoice.payment_failed':
      // Handle failed payment
      console.log('Payment failed for subscription:', event.data.object.subscription);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
```

### 3. Update Payment.jsx

Replace the `handlePayment` function in `/src/pages/Payment.jsx`:

```javascript
const handlePayment = async () => {
  setLoading(true);
  
  try {
    // Call your backend to create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    });

    const { url } = await response.json();
    
    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error) {
    console.error('Payment error:', error);
    alert('Failed to initiate payment. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### 4. Create Success Page

Create `/src/pages/PaymentSuccess.jsx`:

```javascript
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Crown } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateSubscriptionPlan } = useSubscription();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Verify payment with your backend
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const { success } = await response.json();

        if (success) {
          // Update subscription plan
          await updateSubscriptionPlan('professor');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    };

    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId, updateSubscriptionPlan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-gradient-to-br from-slate-900/50 to-purple-900/50 rounded-3xl p-12 border-2 border-purple-500/50"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-white/70 text-lg mb-8">
          Welcome to the Professor Plan. You now have unlimited access to all features!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/mastery')}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold"
        >
          Start Using Premium Features
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
```

### 5. Add Route for Success Page

In `App.jsx`, add:

```javascript
import PaymentSuccess from './pages/PaymentSuccess';

// In Routes:
<Route path="/payment/success" element={<PaymentSuccess />} />
```

### 6. Environment Variables

Add to your `.env` file:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

### 7. Supabase Function to Update Subscription

Create a Supabase Edge Function or use your backend to update user metadata:

```javascript
// Update user subscription in Supabase
async function updateUserSubscription(userId, plan) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      subscription_plan: plan,
      is_premium: plan === 'professor',
    }
  });
  
  if (error) throw error;
  return data;
}
```

### 8. Testing

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any CVC

2. Test webhooks locally using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

### 9. Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Configure webhook secret
- [ ] Test subscription cancellation flow
- [ ] Test payment failure handling
- [ ] Set up email notifications for subscription events
- [ ] Implement subscription management page
- [ ] Add cancel subscription functionality

## Additional Features to Consider

1. **Subscription Management Page**: Allow users to view, update, or cancel their subscription
2. **Billing History**: Show past invoices and payments
3. **Trial Period**: Offer 7-day free trial before charging
4. **Annual Plans**: Add yearly subscription option with discount
5. **Coupon Codes**: Support promotional discounts

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Components](https://stripe.com/docs/stripe-js/react)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

