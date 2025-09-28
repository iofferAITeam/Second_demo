'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/chat/ChatInterface'
import Navbar from '@/components/shared/Navbar'
import { isAuthenticated } from '@/lib/auth'

export default function ChatPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      setIsChecking(false)

      if (!authenticated) {
        router.push('/auth?redirect=/chat')
      }
    }

    checkAuth()
  }, [router])

  // Show loading while checking authentication
  if (isChecking || !isAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-full pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ChatInterface />
    </div>
  )
}