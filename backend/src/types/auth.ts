import { Request } from 'express'

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
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    createdAt: Date
    preferences: {
      language: string
      notifications: boolean
      theme: string
    }
    profile?: any
  }
  token: string
}

export interface JWTPayload {
  userId: string
  email: string
}

// Augment Express Request to add our custom properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
      }
      userId?: string
    }
  }
}

// Export a type alias for convenience
export type AuthRequest = Request