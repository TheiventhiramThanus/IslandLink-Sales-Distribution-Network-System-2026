import { useState, useEffect } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';

interface StripePaymentProps {
    amount: number;
    currency: string;
    onSuccess: (paymentIntentId: string) => void;
    onError: (message: string) => void;
}

export function StripePayment({ amount, currency, onSuccess, onError }: StripePaymentProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            onError('Payment system not ready. Please refresh the page.');
            return;
        }

        setIsProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
                redirect: 'if_required',
            });

            if (error) {
                // Provide more specific error messages
                let errorMessage = error.message || 'Payment failed';

                if (error.type === 'card_error') {
                    errorMessage = `Card Error: ${error.message}`;
                } else if (error.type === 'validation_error') {
                    errorMessage = 'Please check your card details and try again.';
                } else if (error.type === 'invalid_request_error') {
                    errorMessage = 'Payment request error. Please try again or contact support.';
                } else {
                    errorMessage = error.message || 'An unexpected error occurred during payment.';
                }

                // Log the FULL error object for debugging
                console.error('Stripe payment error details:', JSON.stringify(error, null, 2));
                console.error('Error type:', error.type);
                console.error('Error message:', error.message);

                onError(errorMessage);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('Payment successful:', paymentIntent.id);
                onSuccess(paymentIntent.id);
            } else {
                console.warn('Payment status unclear:', paymentIntent?.status);
                onError(`Payment was not successful (Status: ${paymentIntent?.status || 'unknown'})`);
            }
        } catch (err: any) {
            console.error('Internal payment exception:', err);
            onError(err.message || 'A technical error occurred. Please try again or use another payment method.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`min-h-[100px] transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
                <PaymentElement onReady={() => setIsReady(true)} />
            </div>

            {!isReady && !isProcessing && (
                <div className="flex items-center justify-center py-4 text-gray-400">
                    <p className="text-sm">Loading secure form...</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements || !isReady}
                className="w-full py-4 bg-blue-600 text-black text-black text-white rounded-xl hover:bg-blue-700 font-bold transition-all disabled:bg-blue-300 shadow-lg shadow-blue-600 text-black/20"
            >
                {isProcessing ? 'Processing Payment...' : `Pay ${currency === 'LKR' ? 'Rs.' : '$'}${amount.toFixed(2)} Now`}
            </button>
        </form>
    );
}
