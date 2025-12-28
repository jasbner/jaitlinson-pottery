const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

// Define the Stripe secret key as a secret parameter
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');

// Create Stripe Checkout Session (v2)
exports.createCheckoutSession = onRequest(
  {
    secrets: [stripeSecretKey],
    cors: true,
  },
  async (req, res) => {
    // Initialize Stripe with the secret
    const stripe = require('stripe')(stripeSecretKey.value());

    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { items } = req.body;

      // Validate items exist
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items provided' });
      }

      // Convert your cart items to Stripe line items
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: [item.imageURL],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: 1,
      }));

      // Get the origin from headers, default to localhost for testing
      const origin = req.headers.origin || 'http://localhost:3000';

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cancel`,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Webhook will be added later when needed