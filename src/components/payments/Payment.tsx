"use client";

import { useState } from "react";
import PricingModal from "./PricingModal";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PaymentFailureModal from "./PaymentFailureModal";
import StripePayment from "./StripePayment";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment?: () => void;
  attemptCount?: number;
  onAttemptCountChange?: (count: number) => void;
}

type ModalState = "pricing" | "stripe" | "success" | "failed";

export default function PaymentModalContainer({
  isOpen,
  onClose,
  onPayment,
  attemptCount = 0,
  onAttemptCountChange,
}: PricingModalProps) {
  const [modalState, setModalState] = useState<ModalState>("pricing");
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async () => {
    // Move to Stripe payment form
    setModalState("stripe");
  };

  const handleStripeSuccess = (intentId: string) => {
    setPaymentIntentId(intentId);
    setModalState("success");
    onPayment?.();
  };

  const handleStripeError = (error: string) => {
    console.error('Stripe payment error:', error);
    setModalState("failed");
  };

  const handleStripeCancel = () => {
    setModalState("pricing");
  };

  const handleClose = () => {
    setModalState("pricing");
    setPaymentIntentId(null);
    onClose();
  };

  const handleTryAgain = () => {
    setModalState("pricing");
  };

  const handleCheckOrder = () => {
    // This would typically navigate to order page or show order details
    console.log("Navigate to order page");
    handleClose();
  };

  return (
    <>
      <PricingModal
        isOpen={modalState === "pricing"}
        onClose={handleClose}
        onPayment={handlePayment}
      />

      {modalState === "stripe" && (
        <div className="pricing-modal-overlay">
          <div className="pricing-modal">
            <div className="pricing-modal-header">
              <h1 className="pricing-modal-title">Complete Payment</h1>
              <button
                className="close-button"
                onClick={handleStripeCancel}
                aria-label="Close modal"
              >
                <svg
                  className="close-icon"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="stripe-payment-container">
              <StripePayment
                amount={9.90}
                currency="usd"
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                onCancel={handleStripeCancel}
              />
            </div>
          </div>
        </div>
      )}

      <PaymentSuccessModal
        isOpen={modalState === "success"}
        onClose={handleClose}
        onCheckOrder={handleCheckOrder}
      />

      <PaymentFailureModal
        isOpen={modalState === "failed"}
        onClose={handleClose}
        onTryAgain={handleTryAgain}
      />
    </>
  );
}

// Demo component to show how to use the modal
export function PaymentDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  return (
    <div className="payment-demo">
      <button
        className="open-pricing-button"
        onClick={() => setIsModalOpen(true)}
      >
        View Pricing
      </button>

      <PaymentModalContainer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPayment={() => {
          console.log("Payment processing completed!");
          // Don't close modal here - let the payment result determine the next state
        }}
        attemptCount={attemptCount}
        onAttemptCountChange={setAttemptCount}
      />
    </div>
  );
}

// Keep the original PricingModal export for backward compatibility
export { default as PricingModal } from "./PricingModal";
