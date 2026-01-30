import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('[Payment] CRITICAL: STRIPE_SECRET_KEY is not defined in environment variables.');
            return res.status(500).json({ error: 'Payment service configuration error (Secret Key missing)' });
        }

        console.log(`[Payment] Creating intent: ${amount} ${currency}`);

        // Basic validation
        if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
            console.error('[Payment] Invalid amount received:', amount);
            return res.status(400).send({
                error: `Invalid payment amount. Received: ${amount}`,
                receivedBody: req.body
            });
        }

        // Stripe minimum amount check (approx 50 cents)
        if (amount < 0.5) {
            console.error('[Payment] Amount too small for Stripe:', amount);
            return res.status(400).send({ error: 'Payment amount must be at least $0.50' });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amounts in cents
            currency: currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log(`[Payment] Intent created successfully: ${paymentIntent.id}`);
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Stripe Error:', {
            message: error.message,
            type: error.type,
            code: error.code,
            param: error.param,
            status: error.statusCode
        });
        res.status(500).send({ error: error.message || 'Internal Server Error in Stripe integration' });
    }
});

export default router;
