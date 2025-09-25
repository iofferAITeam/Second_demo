import { Request, Response, NextFunction } from 'express'
import { TokenService } from '../utils/token'
import { AuthDatabaseService } from '../database'
import { logger } from '../utils/logger'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)

    const decoded = TokenService.verifyAccessToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const user = await AuthDatabaseService.findUserById(decoded.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    }

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
      const user = await AuthDatabaseService.findUserById(decoded.userId)

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