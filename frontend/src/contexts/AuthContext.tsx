'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { isAuthenticated, getUserDataFromToken, getToken } from '@/lib/auth'

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
  login: (token: string) => void
  logout: () => void
  checkAuth: () => void
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
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [token, setTokenState] = useState<string | null>(null)

  const checkAuth = () => {
    setIsLoading(true)
    const currentToken = getToken()
    const authStatus = isAuthenticated()

    if (authStatus && currentToken) {
      const userData = getUserDataFromToken()
      setIsAuth(true)
      setUser(userData)
      setTokenState(currentToken)
    } else {
      setIsAuth(false)
      setUser(null)
      setTokenState(null)
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
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    isAuthenticated: isAuth,
    isLoading,
    user,
    token,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}