'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth',
  fallback
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShouldRender(false)
      return
    }

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      setShouldRender(false)
      return
    }

    if (!requireAuth && isAuthenticated) {
      router.push('/chat')
      setShouldRender(false)
      return
    }

    setShouldRender(true)
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo])

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    )
  }

  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}

// 专用的需要认证的路由守卫
export function ProtectedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth" fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// 专用的不需要认证的路由守卫（如登录页面）
export function PublicRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false} redirectTo="/chat" fallback={fallback}>
      {children}
    </AuthGuard>
  )
}