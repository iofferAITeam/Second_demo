// 认证相关类型定义

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  preferences: {
    language: "zh" | "en"
    notifications: boolean
    theme: "light" | "dark"
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}