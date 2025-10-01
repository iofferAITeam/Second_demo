import { Response, NextFunction } from 'express'
import { TokenService } from '../utils/token'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'
import { AuthRequest } from '../types/auth'

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    console.log('🔍 Received token:', token.substring(0, 50) + '...')

    const decoded = TokenService.verifyAccessToken(token)
    console.log('🔍 Token decoded:', decoded)
    if (!decoded) {
      console.log('❌ Token verification failed')
      return res.status(401).json({ error: 'Invalid token' })
    }

    console.log('🔍 Looking up user with ID:', decoded.userId)
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    console.log('🔍 User lookup result:', user ? 'Found' : 'Not found')

    if (!user) {
      console.log('❌ User not found in database')
      return res.status(404).json({ error: 'User not found' })
    }

    // User always exists in mock mode

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    }
    req.userId = user.id

    console.log('✅ Auth middleware completed, userId set:', user.id)
    next()
  } catch (error) {
    logger.error('Token authentication error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.substring(7)
    const decoded = TokenService.verifyAccessToken(token)

    if (decoded) {
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true
        }
      })

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    }

    next()
  } catch (error) {
    next()
  }
}