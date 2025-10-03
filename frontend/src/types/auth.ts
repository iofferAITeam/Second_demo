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
  profile?: UserProfile
  // Premium subscription fields
  isPremium?: boolean
  subscriptionStatus?: 'INACTIVE' | 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE'
  subscriptionEndDate?: Date
}

export interface UserProfile {
  id: string
  userId: string
  phone?: string
  wechat?: string
  birthDate?: Date
  nationality?: string
  currentEducation?: string
  gpa?: number
  major?: string
  graduationDate?: Date
  toefl?: number
  ielts?: number
  gre?: number
  gmat?: number
  experiences?: any
  goals?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
  message?: string
}

export interface AuthError {
  error: string
  message?: string
}