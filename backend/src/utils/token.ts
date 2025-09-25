import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { logger } from './logger'

// Token 配置
const ACCESS_TOKEN_EXPIRES_IN = '15m'  // Access token 15分钟过期
const REFRESH_TOKEN_EXPIRES_IN = '7d'  // Refresh token 7天过期

interface TokenPayload {
  userId: string
  email: string
  type: 'access' | 'refresh'
}

export class TokenService {
  // 生成 Access Token
  static generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    )
  }

  // 生成 Refresh Token
  static generateRefreshToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    )
  }

  // 验证 Access Token
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type')
      }
      return decoded
    } catch (error) {
      logger.error('Access token verification failed:', error)
      return null
    }
  }

  // 验证 Refresh Token
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }
      return decoded
    } catch (error) {
      logger.error('Refresh token verification failed:', error)
      return null
    }
  }

  // 生成安全的 Refresh Token 字符串（用于数据库存储）
  static generateSecureRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex')
  }

  // 计算 Refresh Token 过期时间
  static getRefreshTokenExpirationDate(): Date {
    const now = new Date()
    now.setDate(now.getDate() + 7) // 7天后过期
    return now
  }

  // 生成 token 对
  static generateTokenPair(userId: string, email: string) {
    const accessToken = this.generateAccessToken(userId, email)
    const refreshToken = this.generateRefreshToken(userId, email)
    const refreshTokenSecure = this.generateSecureRefreshToken()
    const refreshTokenExpiresAt = this.getRefreshTokenExpirationDate()

    return {
      accessToken,
      refreshToken,
      refreshTokenSecure,
      refreshTokenExpiresAt
    }
  }
}