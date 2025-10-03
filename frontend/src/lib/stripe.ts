import { loadStripe, Stripe } from '@stripe/stripe-js'

// Stripe publishable key - you should replace this with your actual publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RnLK3GlzXesb4eUiQXUVBrVop7dIJqbhyU0hZn1mo1wdt12EYkqzxNnNoIu7HzlCkw6Z5nQNxKiVnQ587bScfUm00kzei2JSi'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Payment service functions
export const paymentService = {
  // Create payment intent
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  },

  // Confirm payment
  async confirmPayment(paymentIntentId: string) {
    try {
      const response = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm payment')
      }

      return await response.json()
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw error
    }
  },

  // Get payment status
  async getPaymentStatus(paymentIntentId: string) {
    try {
      const response = await fetch(`/api/payments/payment-status/${paymentIntentId}`)

      if (!response.ok) {
        throw new Error('Failed to get payment status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting payment status:', error)
      throw error
    }
  },

  // Handle successful payment and update user subscription
  async handleSuccessfulPayment(paymentIntentId: string, userId: string) {
    try {
      const response = await fetch('/api/payments/handle-successful-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          userId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      return await response.json()
    } catch (error) {
      console.error('Error handling successful payment:', error)
      throw error
    }
  },

  // Get user subscription status
  async getSubscriptionStatus(userId: string) {
    try {
      const response = await fetch(`/api/payments/subscription-status/${userId}`)

      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting subscription status:', error)
      throw error
    }
  },

  // MAIN PAYMENT FUNCTION: Process payment for user
  async processPayment(userId: string) {
    try {
      const response = await fetch('/api/payments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process payment')
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }
}


