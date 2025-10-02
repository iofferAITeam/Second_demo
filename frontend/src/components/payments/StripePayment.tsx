"use client";

import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe, paymentService } from "@/lib/stripe";

interface StripePaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

function StripePaymentForm({ amount, currency = 'usd', onSuccess, onError, onCancel }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const { clientSecret } = await paymentService.createPaymentIntent(amount, currency, {
        service: 'iOffer Premium Subscription',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onError(stripeError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment was not completed');
        onError('Payment was not completed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="payment-element-container">
        <PaymentElement 
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: 'auto'
            }
          }}
        />
      </div>
      
      {error && (
        <div className="payment-error">
          <p>{error}</p>
        </div>
      )}

      <div className="payment-actions">
        <button
          type="button"
          onClick={onCancel}
          className="payment-button secondary"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="payment-button primary"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function StripePayment({ amount, currency, onSuccess, onError, onCancel }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    setIsLoading(true);
    try {
      const { clientSecret: secret } = await paymentService.createPaymentIntent(amount, currency, {
        service: 'iOffer Premium Subscription',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      setClientSecret(secret);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="stripe-payment-initializer">
        <button
          onClick={initializePayment}
          className="payment-button primary"
          disabled={isLoading}
        >
          {isLoading ? 'Initializing...' : 'Initialize Payment'}
        </button>
      </div>
    );
  }

  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
}


