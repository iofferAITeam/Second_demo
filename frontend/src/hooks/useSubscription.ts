import { useState, useEffect } from 'react'
import { paymentService } from '@/lib/stripe'

export interface SubscriptionStatus {
  isPremium: boolean
  status: string
  plan: string | null
  startDate: string | null
  endDate: string | null
  paymentMethod: string | null
  lastPaymentDate: string | null
  nextPaymentDate: string | null
  isExpired: boolean
}

export function useSubscription(userId: string | null) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptionStatus = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await paymentService.getSubscriptionStatus(userId)
      if (response.success) {
        setSubscription(response.subscription)
      } else {
        setError('Failed to fetch subscription status')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription status'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [userId])

  const refreshSubscription = () => {
    fetchSubscriptionStatus()
  }

  return {
    subscription,
    isLoading,
    error,
    refreshSubscription,
    isPremium: subscription?.isPremium || false,
    isExpired: subscription?.isExpired || false
  }
}

