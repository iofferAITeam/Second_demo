'use client'

import { useState, useEffect } from 'react'
import { AuthState, LoginRequest, RegisterRequest } from '../types/auth'
import { authService } from '../state/auth-service'

export function useAuth() {
  const [state, setState] = useState<AuthState>(authService.getState())

  useEffect(() => {
    // 订阅认证状态变化
    const unsubscribe = authService.subscribe(setState)

    // 组件卸载时取消订阅
    return unsubscribe
  }, [])

  // 登录
  const signIn = async (credentials: LoginRequest) => {
    try {
      await authService.signIn(credentials)
    } catch (error) {
      // 错误已经在authService中处理，这里可以选择性地重新抛出
      throw error
    }
  }

  // 注册
  const signUp = async (data: RegisterRequest) => {
    try {
      await authService.signUp(data)
    } catch (error) {
      throw error
    }
  }

  // 登出
  const signOut = async () => {
    try {
      await authService.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // 清除错误
  const clearError = () => {
    authService.clearError()
  }

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      await authService.refreshUser()
    } catch (error) {
      console.error('Refresh user failed:', error)
    }
  }

  return {
    // 状态
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    // 操作方法
    signIn,
    signUp,
    signOut,
    clearError,
    refreshUser,
  }
}
