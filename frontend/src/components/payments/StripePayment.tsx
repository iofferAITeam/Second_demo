"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface StripePaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

function StripePaymentForm({ amount, currency = 'usd', onSuccess, onError, onCancel }: StripePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsProcessing(true);
    setError(null);

    try {
      // Get card number from form
      const cardNumberInput = document.getElementById('card-number') as HTMLInputElement;
      const cardNumber = cardNumberInput?.value?.replace(/\s/g, '') || '';
      
      // Simulate payment processing with test payment API
      const userId = user?.id;
      
      if (!userId) {
        setError('User not authenticated');
        onError('User not authenticated');
        setIsProcessing(false);
        return;
      }
      
      console.log('Processing payment for user:', userId);
      
      // Call the payment processing API with card number
      const response = await fetch('/api/payments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, cardNumber }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Payment successful
        const paymentIntentId = 'test-payment-' + Date.now();
        onSuccess(paymentIntentId);
      } else {
        // Payment failed
        const errorMessage = data.error || 'Payment failed';
        setError(errorMessage);
        onError(errorMessage);
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
    <form onSubmit={handleSubmit} className="stripe-payment-form" style={{ 
      padding: '20px',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="payment-element-container">
        <div className="payment-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="card-number" style={{ fontWeight: 'bold', fontSize: '14px' }}>Card Number</label>
            <input
              type="text"
              id="card-number"
              placeholder="1234 5678 9012 3456"
              className="payment-input"
              required
              style={{ 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '16px' 
              }}
            />
          </div>
          
          <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label htmlFor="expiry" style={{ fontWeight: 'bold', fontSize: '14px' }}>Expiry Date</label>
              <input
                type="text"
                id="expiry"
                placeholder="MM/YY"
                className="payment-input"
                required
                style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '16px' 
                }}
              />
            </div>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label htmlFor="cvc" style={{ fontWeight: 'bold', fontSize: '14px' }}>CVC</label>
              <input
                type="text"
                id="cvc"
                placeholder="123"
                className="payment-input"
                required
                style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '16px' 
                }}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="cardholder" style={{ fontWeight: 'bold', fontSize: '14px' }}>Cardholder Name</label>
            <input
              type="text"
              id="cardholder"
              placeholder="John Doe"
              className="payment-input"
              required
              style={{ 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '16px' 
              }}
            />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="payment-error" style={{ 
          background: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: '4px', 
          padding: '10px', 
          color: '#c33',
          marginTop: '10px'
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* FORCE REFRESH - Simple test buttons */}
      <div id="payment-buttons-container" style={{ 
        marginTop: '30px', 
      }}>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="pay-now-btn"
            type="submit"
            style={{ 
              padding: '15px 25px',
              border: '3px solid #1C5DFF',
              borderRadius: '8px',
              background: '#1C5DFF',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minWidth: '150px'
            }}
          >
            ✅ {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function StripePayment({ amount, currency, onSuccess, onError, onCancel }: StripePaymentProps) {
  return (
    <StripePaymentForm
      amount={amount}
      currency={currency}
      onSuccess={onSuccess}
      onError={onError}
      onCancel={onCancel}
    />
  );
}


