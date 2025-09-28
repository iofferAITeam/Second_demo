import { useState, useEffect } from 'react'
import { AuthState, LoginRequest, RegisterRequest } from '@/types/auth'
import { authService } from '@/state/auth-service'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getState())

  useEffect(() => {
    // 订阅认证状态变化
    const unsubscribe = authService.subscribe((newState) => {
      setAuthState(newState)
    })

    // 组件卸载时取消订阅
    return unsubscribe
  }, [])

  const signIn = async (credentials: LoginRequest) => {
    await authService.signIn(credentials)
  }

  const signUp = async (data: RegisterRequest) => {
    await authService.signUp(data)
  }

  const signOut = async () => {
    await authService.signOut()
  }

  const clearError = () => {
    authService.clearError()
  }

  const refreshUser = async () => {
    await authService.refreshUser()
  }

  return {
    // 状态
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // 操作
    signIn,
    signUp,
    signOut,
    clearError,
    refreshUser,
  }
}
