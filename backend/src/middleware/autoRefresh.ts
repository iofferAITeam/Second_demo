import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { TokenService } from '../utils/token'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
  newTokens?: {
    accessToken: string
    refreshToken: string
  }
}

// 自动续期中间件 - 当 access token 快过期时自动生成新的 tokens
export const autoRefreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.substring(7)

    // 验证 token 签名但允许过期（安全且支持自动刷新）
    let decodedToken: any
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!, {
        ignoreExpiration: true  // 允许过期的token进行刷新检查
      }) as any
    } catch (error) {
      // Token签名无效或格式错误，跳过自动刷新
      logger.warn('Token signature invalid, skipping auto-refresh')
      return next()
    }

    if (!decodedToken || !decodedToken.exp) {
      return next()
    }

    // 检查 token 是否在5分钟内过期
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = decodedToken.exp - now
    const REFRESH_THRESHOLD = 5 * 60 // 5分钟

    if (expiresIn > REFRESH_THRESHOLD) {
      // Token 还有很长时间才过期，继续
      return next()
    }

    // Token 快过期了，尝试自动刷新
    logger.info(`Token expiring soon for user ${decodedToken.userId}, attempting auto-refresh`)

    // 尝试从数据库获取用户信息和refresh token
    const user = await prisma.users.findUnique({
      where: { id: decodedToken.userId },
      select: {
        id: true,
        email: true,
        name: true,
        refreshToken: true,
        refreshTokenExpiresAt: true,
      },
    })

    if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) {
      logger.warn(`Auto-refresh failed: no valid refresh token for user ${decodedToken.userId}`)
      return next()
    }

    // 检查 refresh token 是否过期
    if (user.refreshTokenExpiresAt < new Date()) {
      logger.warn(`Auto-refresh failed: refresh token expired for user ${decodedToken.userId}`)
      await prisma.users.update({
        where: { id: user.id },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      })
      return next()
    }

    // 生成新的 token 对
    const newTokens = TokenService.generateTokenPair(user.id, user.email)

    // 更新数据库中的 refresh token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        refreshToken: newTokens.refreshTokenSecure,
        refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt,
      },
    })

    // 将新 tokens 添加到响应头中
    res.setHeader('X-New-Access-Token', newTokens.accessToken)
    res.setHeader('X-New-Refresh-Token', newTokens.refreshToken)

    // 为了方便前端检测，添加一个标识
    res.setHeader('X-Token-Refreshed', 'true')

    // 将新 tokens 附加到请求对象，以便其他中间件可以使用
    req.newTokens = {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken
    }

    logger.info(`Token auto-refreshed for user: ${user.email}`)

    next()
  } catch (error) {
    logger.error('Auto-refresh middleware error:', error)
    // 出错时继续执行，不影响正常请求
    next()
  }
}

// 响应拦截器 - 在所有响应中添加新 token 信息
export const injectTokensInResponse = (req: AuthRequest, res: Response, next: NextFunction) => {
  const originalJson = res.json

  res.json = function (body: any) {
    // 如果有新 tokens，将它们添加到响应体中
    if (req.newTokens) {
      body = {
        ...body,
        tokenRefreshed: true,
        newTokens: req.newTokens
      }
    }

    return originalJson.call(this, body)
  }

  next()
}