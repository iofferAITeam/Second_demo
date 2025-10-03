import Stripe from 'stripe'

// Stripe configuration
export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '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',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_51RnLK3GlzXesb4eUiQXUVBrVop7dIJqbhyU0hZn1mo1wdt12EYkqzxNnNoIu7HzlCkw6Z5nQNxKiVnQ587bScfUm00kzei2JSi',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here',
  apiVersion: '2025-09-30.clover' as const
}

// Initialize Stripe instance
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
})

// Payment configuration
export const paymentConfig = {
  defaultCurrency: 'usd',
  defaultAmount: 9.90, // $9.90 for iOffer premium subscription
  serviceName: 'iOffer Premium Subscription',
  serviceDescription: 'Unlimited AI Conversations, Personalized School Fit Analysis, Admission Rate Predictions, In-Depth Strategy Guidance'
}
