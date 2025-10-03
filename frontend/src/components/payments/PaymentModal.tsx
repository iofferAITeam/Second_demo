"use client";

import { useState } from 'react';
import StripePayment from './StripePayment';
import '@/styles/payment.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<'pricing' | 'payment'>('pricing');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setPaymentStep('payment');
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setIsProcessing(true);
    onSuccess(paymentIntentId);
    // Close modal after a short delay
    setTimeout(() => {
      onClose();
      setPaymentStep('pricing');
      setIsProcessing(false);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error);
  };

  const handleCancel = () => {
    setPaymentStep('pricing');
  };

  return (
    <div className="pricing-modal-overlay">
      <div className="pricing-modal">
        {/* Header */}
        <div className="pricing-modal-header">
          <h2 className="pricing-modal-title">
            {paymentStep === 'pricing' ? 'Upgrade to Premium' : 'Complete Payment'}
          </h2>
          <button onClick={onClose} className="close-button">
            <svg className="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {paymentStep === 'pricing' ? (
          <div className="pricing-content">
            {/* Left Side - Company Info */}
            <div className="pricing-left">
              <div className="pricing-content-container">
                <div className="pricing-icon">
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="45" fill="#1c5dff" opacity="0.1"/>
                    <path d="M30 50L45 65L70 35" stroke="#1c5dff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="pricing-text">
                  <h3 className="pricing-title">iOffer Premium</h3>
                  <p className="pricing-description">
                    Unlimited AI Conversations, Personalized School Fit Analysis, 
                    Admission Rate Predictions, In-Depth Strategy Guidance
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Pricing */}
            <div className="pricing-right">
              <div className="pricing-card">
                <div className="pricing-header">
                  <h4 className="plan-name">Premium Plan</h4>
                  <div className="price-container">
                    <span className="currency">$</span>
                    <span className="price">9.90</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Unlimited AI Conversations</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Personalized School Fit Analysis</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Admission Rate Predictions</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>In-Depth Strategy Guidance</span>
                  </div>
                </div>

                <button 
                  onClick={handlePayNow}
                  className="pay-button"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="payment-step">
            <StripePayment
              amount={9.90}
              currency="usd"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Payment Terms */}
        <div className="payment-terms">
          <h4 className="terms-title">Payment Terms</h4>
          <ul className="terms-list">
            <li className="terms-item">Secure payment processed by Stripe</li>
            <li className="terms-item">Cancel anytime from your account settings</li>
            <li className="terms-item">Questions? Contact us at <span className="contact-email">support@ioffer.com</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
