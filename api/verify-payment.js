import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      res.status(200).json({ 
        success: true, 
        session: {
          id: session.id,
          payment_status: session.payment_status,
          customer: session.customer,
          subscription: session.subscription,
        }
      });
    } else {
      res.status(200).json({ 
        success: false, 
        payment_status: session.payment_status 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
}

