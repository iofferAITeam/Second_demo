"use client";

import { useState } from "react";
import PricingModal from "./PricingModal";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PaymentFailureModal from "./PaymentFailureModal";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment?: () => void;
  attemptCount?: number;
  onAttemptCountChange?: (count: number) => void;
}

type ModalState = "pricing" | "success" | "failed";

export default function PaymentModalContainer({
  isOpen,
  onClose,
  onPayment,
  attemptCount = 0,
  onAttemptCountChange,
}: PricingModalProps) {
  const [modalState, setModalState] = useState<ModalState>("pricing");

  if (!isOpen) return null;

  const handlePayment = async () => {
    // Simulate payment processing with alternating result
    setTimeout(() => {
      // Increment attempt count
      const newAttemptCount = attemptCount + 1;
      onAttemptCountChange?.(newAttemptCount);

      // First click shows success, second shows failure, third shows success, etc.
      const isSuccess = newAttemptCount % 2 === 1; // Odd attempts = success, even attempts = failure
      setModalState(isSuccess ? "success" : "failed");
      onPayment?.();
    }, 2000);
  };

  const handleClose = () => {
    setModalState("pricing");
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
