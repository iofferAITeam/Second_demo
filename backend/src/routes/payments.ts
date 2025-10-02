import { Router, Request, Response } from 'express'
import { stripe, paymentConfig } from '../config/stripe'
import { logger } from '../utils/logger'
import Stripe from 'stripe'

const router = Router()

// Create payment intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount = paymentConfig.defaultAmount, currency = paymentConfig.defaultCurrency, metadata = {} } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount. Amount must be greater than 0.'
      })
    }

    // Convert amount to cents (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        ...metadata,
        service: paymentConfig.serviceName,
        description: paymentConfig.serviceDescription,
        timestamp: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    logger.info(`Payment intent created: ${paymentIntent.id}`)

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    logger.error('Error creating payment intent:', error)
    res.status(500).json({
      error: 'Failed to create payment intent'
    })
  }
})

// Confirm payment intent
router.post('/confirm-payment', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Payment intent ID is required'
      })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent) {
      return res.status(404).json({
        error: 'Payment intent not found'
      })
    }

    logger.info(`Payment intent retrieved: ${paymentIntent.id}, status: ${paymentIntent.status}`)

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    })
  } catch (error) {
    logger.error('Error confirming payment:', error)
    res.status(500).json({
      error: 'Failed to confirm payment'
    })
  }
})

// Get payment status
router.get('/payment-status/:paymentIntentId', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      created: paymentIntent.created
    })
  } catch (error) {
    logger.error('Error retrieving payment status:', error)
    res.status(500).json({
      error: 'Failed to retrieve payment status'
    })
  }
})

// Create customer (optional - for future use)
router.post('/create-customer', async (req: Request, res: Response) => {
  try {
    const { email, name, metadata = {} } = req.body

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        service: 'iOffer',
        created_at: new Date().toISOString()
      }
    })

    logger.info(`Customer created: ${customer.id}`)

    res.json({
      customerId: customer.id,
      email: customer.email
    })
  } catch (error) {
    logger.error('Error creating customer:', error)
    res.status(500).json({
      error: 'Failed to create customer'
    })
  }
})

// Webhook endpoint for Stripe events (for production use)
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!endpointSecret) {
      logger.warn('Stripe webhook secret not configured')
      return res.status(400).send('Webhook secret not configured')
    }

    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Webhook signature verification failed:', err)
    return res.status(400).send(`Webhook Error: ${errorMessage}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      logger.info(`Payment succeeded: ${paymentIntent.id}`)
      // Here you can update your database, send confirmation emails, etc.
      break
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      logger.warn(`Payment failed: ${failedPayment.id}`)
      // Handle failed payment
      break
    default:
      logger.info(`Unhandled event type: ${event.type}`)
  }

  res.json({ received: true })
})

export default router
