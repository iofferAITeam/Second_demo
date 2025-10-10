'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { isAuthenticated, getUserDataFromToken, getToken } from '@/lib/auth'
import { apiClient } from '@/utils/api-client'

interface UserData {
  id: string
  email: string
  name?: string
  exp: number
  iat: number
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserData | null
  token: string | null
  error: string | null
  login: (token: string) => void
  logout: () => void
  checkAuth: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, name: string, password: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load cached user data from localStorage immediately (optimistic UI)
  const getCachedUser = (): UserData | null => {
    if (typeof window === 'undefined') return null
    try {
      const cached = localStorage.getItem('cached_user')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }

  const [isAuth, setIsAuth] = useState<boolean>(false) // Start as false to avoid hydration mismatch
  const [isLoading, setIsLoading] = useState<boolean>(true) // Start as loading to handle auth check
  const [user, setUser] = useState<UserData | null>(null) // Start as null to avoid hydration mismatch
  const [token, setTokenState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    setIsLoading(true)
    const currentToken = getToken()
    const authStatus = isAuthenticated()

    // Try to get cached user for optimistic UI
    const cachedUser = getCachedUser()
    if (cachedUser && authStatus && currentToken) {
      // Set optimistic state first
      setIsAuth(true)
      setUser(cachedUser)
      setTokenState(currentToken)
    }

    if (authStatus && currentToken) {
      try {
        // Verify token with backend (this will auto-refresh if needed)
        const response = await apiClient.verify()
        if (response.user) {
          setIsAuth(true)
          setUser(response.user)
          setTokenState(getToken()) // Get potentially refreshed token
          // Cache user data for next load
          if (typeof window !== 'undefined') {
            localStorage.setItem('cached_user', JSON.stringify(response.user))
          }
        } else {
          // Verification failed
          setIsAuth(false)
          setUser(null)
          setTokenState(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cached_user')
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        // Only clear auth if it's truly invalid (not just network error)
        const userData = getUserDataFromToken()
        if (userData) {
          // Token exists and is valid format, keep user logged in
          setIsAuth(true)
          setUser(userData)
          setTokenState(currentToken)
        } else {
          setIsAuth(false)
          setUser(null)
          setTokenState(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cached_user')
          }
        }
      }
    } else {
      setIsAuth(false)
      setUser(null)
      setTokenState(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cached_user')
      }
    }

    setIsLoading(false)
  }

  const login = (newToken: string) => {
    // Token is already stored by setToken in auth.ts
    checkAuth()
  }

  const logout = () => {
    // Clear tokens using auth.ts functions
    require('@/lib/auth').clearAuthTokens()
    setIsAuth(false)
    setUser(null)
    setTokenState(null)
    setError(null)
    // Clear cached user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cached_user')
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.login(email, password)
      
      if (response.success && response.user) {
        setIsAuth(true)
        setUser(response.user)
        setTokenState(apiClient['getAccessToken']())
        // Cache user data for next load
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_user', JSON.stringify(response.user))
        }
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up with email, name and password
  const signUp = async (email: string, name: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.register(email, name, password)
      
      if (response.success && response.user) {
        setIsAuth(true)
        setUser(response.user)
        setTokenState(apiClient['getAccessToken']())
        // Cache user data for next load
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_user', JSON.stringify(response.user))
        }
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    isAuthenticated: isAuth,
    isLoading,
    user,
    token,
    error,
    login,
    logout,
    checkAuth,
    signIn,
    signUp,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}