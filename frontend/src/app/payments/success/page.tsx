"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    if (paymentIntentId) {
      // Fetch payment status from backend
      fetch(`/api/payments/payment-status/${paymentIntentId}`)
        .then(response => response.json())
        .then(data => {
          setPaymentStatus(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching payment status:', err);
          setError('Failed to fetch payment status');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for subscribing to iOffer Premium. Your payment has been processed successfully.
          </p>

          {/* Payment Details */}
          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    ${(paymentStatus.amount / 100).toFixed(2)} {paymentStatus.currency?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {paymentStatus.status}
                  </span>
                </div>
                {paymentStatus.metadata?.service && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {paymentStatus.metadata.service}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Using iOffer
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>You can now access all premium features including:</p>
              <ul className="mt-2 space-y-1">
                <li>• Unlimited AI Conversations</li>
                <li>• Personalized School Fit Analysis</li>
                <li>• Admission Rate Predictions</li>
                <li>• In-Depth Strategy Guidance</li>
              </ul>
            </div>
          </div>

          {/* Support Contact */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a
                href="mailto:iofferpublic@gmail.com"
                className="text-blue-600 hover:underline"
              >
                iofferpublic@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


