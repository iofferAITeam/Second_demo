import { Router, Request, Response } from 'express'
import { stripe, paymentConfig } from '../config/stripe'
import { logger } from '../utils/logger'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

// Handle successful payment and update user subscription
router.post('/handle-successful-payment', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, userId } = req.body

    if (!paymentIntentId || !userId) {
      return res.status(400).json({
        error: 'Payment intent ID and user ID are required'
      })
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not successful'
      })
    }

    // Calculate subscription end date (1 month from now)
    const subscriptionStartDate = new Date()
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)

    // Update user subscription status
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        isPremium: true,
        subscriptionStatus: 'ACTIVE',
        stripeCustomerId: paymentIntent.customer as string || null,
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate,
        subscriptionPlan: 'premium',
        paymentMethod: 'stripe',
        lastPaymentDate: new Date(),
        nextPaymentDate: subscriptionEndDate
      }
    })

    logger.info(`User ${userId} subscription updated to premium`)

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionEndDate: updatedUser.subscriptionEndDate
      }
    })
  } catch (error) {
    logger.error('Error handling successful payment:', error)
    res.status(500).json({
      error: 'Failed to update subscription'
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

// Get user subscription status
router.get('/subscription-status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isPremium: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionPlan: true,
        paymentMethod: true,
        lastPaymentDate: true,
        nextPaymentDate: true
      }
    })

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    // Check if subscription is expired
    const now = new Date()
    const isExpired = user.subscriptionEndDate && user.subscriptionEndDate < now

    res.json({
      success: true,
      subscription: {
        isPremium: user.isPremium && !isExpired,
        status: isExpired ? 'EXPIRED' : user.subscriptionStatus,
        plan: user.subscriptionPlan,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        paymentMethod: user.paymentMethod,
        lastPaymentDate: user.lastPaymentDate,
        nextPaymentDate: user.nextPaymentDate,
        isExpired: isExpired
      }
    })
  } catch (error) {
    logger.error('Error getting subscription status:', error)
    res.status(500).json({
      error: 'Failed to get subscription status'
    })
  }
})

// MAIN PAYMENT ENDPOINT: Process payment based on card number
router.post('/process-payment', async (req: Request, res: Response) => {
  try {
    const { userId, cardNumber } = req.body

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      })
    }

    // Check for failure test cards
    if (cardNumber === '4000000000000002') {
      return res.status(400).json({
        success: false,
        error: 'Your card was declined. Please try a different payment method.'
      })
    }

    if (cardNumber === '4000000000009995') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds. Please try a different payment method.'
      })
    }

    // Calculate subscription end date (1 month from now)
    const subscriptionStartDate = new Date()
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)

    // Update user subscription status
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        isPremium: true,
        subscriptionStatus: 'ACTIVE',
        stripeCustomerId: 'test_customer_' + Date.now(),
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate,
        subscriptionPlan: 'premium',
        paymentMethod: 'test',
        lastPaymentDate: new Date(),
        nextPaymentDate: subscriptionEndDate
      }
    })

    logger.info(`TEST: User ${userId} subscription updated to premium`)

    res.json({
      success: true,
      message: 'TEST: Subscription activated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionEndDate: updatedUser.subscriptionEndDate
      }
    })
  } catch (error) {
    logger.error('Error in test payment:', error)
    res.status(500).json({
      error: 'Failed to update subscription'
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
