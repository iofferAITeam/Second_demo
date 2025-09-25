import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'
import { TokenService } from '../utils/token'
import { AuthDatabaseService } from '../database'

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body

      // 验证输入
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" })
      }

      // 检查用户是否已存在
      const existingUser = await AuthDatabaseService.findUserByEmail(email)
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" })
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12)

      // 创建用户
      const user = await AuthDatabaseService.createUser({
        email,
        name,
        password: hashedPassword,
      })

      // 生成 token 对
      const tokens = TokenService.generateTokenPair(user.id, user.email)

      // 保存 refresh token 到数据库
      await AuthDatabaseService.updateRefreshToken(
        user.id,
        tokens.refreshTokenSecure,
        tokens.refreshTokenExpiresAt
      )

      logger.info(`User registered successfully: ${email}`)

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          preferences: {
            language: user.language,
            notifications: user.notifications,
            theme: user.theme,
          },
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      })
    } catch (error) {
      logger.error("Registration error:", error)
      next(error)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      // 验证输入
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" })
      }

      // 查找用户
      const user = await AuthDatabaseService.findUserByEmail(email)
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // 生成 token 对
      const tokens = TokenService.generateTokenPair(user.id, user.email)

      // 保存 refresh token 到数据库
      await AuthDatabaseService.updateRefreshToken(
        user.id,
        tokens.refreshTokenSecure,
        tokens.refreshTokenExpiresAt
      )

      logger.info(`User logged in successfully: ${email}`)

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          preferences: {
            language: user.language,
            notifications: user.notifications,
            theme: user.theme,
          },
          profile: user.profile,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      })
    } catch (error) {
      logger.error("Login error:", error)
      next(error)
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" })
      }

      const token = authHeader.substring(7)

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "Server configuration error" })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string }

      const user = await AuthDatabaseService.findUserById(decoded.userId)

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          preferences: {
            language: user.language,
            notifications: user.notifications,
            theme: user.theme,
          },
        }
      })
    } catch (error) {
      logger.error("Token verification error:", error)
      res.status(401).json({ error: "Invalid token" })
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // 从请求头获取用户信息（需要认证中间件）
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        const decoded = TokenService.verifyAccessToken(token)

        if (decoded && decoded.userId) {
          // 清除用户的 refresh token
          await AuthDatabaseService.clearRefreshToken(decoded.userId)
          logger.info(`User logged out: ${decoded.email}`)
        }
      }

      res.json({ success: true, message: 'Logged out successfully' })
    } catch (error) {
      logger.error("Logout error:", error)
      next(error)
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' })
      }

      // 验证 refresh token 格式
      const decoded = TokenService.verifyRefreshToken(refreshToken)
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid refresh token' })
      }

      // 从数据库验证 refresh token
      const user = await AuthDatabaseService.validateRefreshToken(decoded.userId, refreshToken)
      if (!user) {
        return res.status(401).json({ error: 'Refresh token expired or invalid' })
      }

      // 生成新的 token 对
      const tokens = TokenService.generateTokenPair(user.id, user.email)

      // 更新数据库中的 refresh token
      await AuthDatabaseService.updateRefreshToken(
        user.id,
        tokens.refreshTokenSecure,
        tokens.refreshTokenExpiresAt
      )

      logger.info(`Token refreshed for user: ${user.email}`)

      res.json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      })
    } catch (error) {
      logger.error("Token refresh error:", error)
      res.status(401).json({ error: 'Invalid refresh token' })
    }
  }

  static async sendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      // TODO: 实现邮件发送逻辑
      logger.info(`Verification email sent to: ${email}`)
      res.json({ message: 'Verification email sent' })
    } catch (error) {
      next(error)
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body
      // TODO: 实现邮箱验证逻辑
      logger.info('Email verified')
      res.json({ message: 'Email verified successfully' })
    } catch (error) {
      next(error)
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      // TODO: 实现密码重置邮件发送逻辑
      logger.info(`Password reset email sent to: ${email}`)
      res.json({ message: 'Password reset email sent' })
    } catch (error) {
      next(error)
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body
      // TODO: 实现密码重置逻辑
      logger.info('Password reset completed')
      res.json({ message: 'Password reset successful' })
    } catch (error) {
      next(error)
    }
  }
}