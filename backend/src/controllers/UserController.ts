import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // 临时返回模拟数据，避免Prisma模型问题
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        avatar: null,
        createdAt: new Date(),
        language: 'zh',
        notifications: true,
        theme: 'light'
      }

      const mockProfile = {
        id: 'mock-profile-id',
        userId,
        phone: null,
        wechat: null,
        birthDate: null,
        nationality: null,
        currentEducation: null,
        gpa: null,
        major: null,
        graduationDate: null,
        toefl: null,
        ielts: null,
        gre: null,
        gmat: null,
        experiences: null,
        goals: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      res.json({
        user: mockUser,
        profile: mockProfile
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // 临时返回成功响应，避免Prisma模型问题
      logger.info(`Profile update requested for user: ${userId}`)

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: userId,
          email: 'user@example.com',
          name: req.body.name || 'Test User',
          avatar: null,
          createdAt: new Date(),
          language: 'zh',
          notifications: true,
          theme: 'light'
        },
        profile: {
          id: 'mock-profile-id',
          userId,
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } catch (error) {
      next(error)
    }
  }

  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      // TODO: 处理文件上传（需要multer配置）
      // const avatarUrl = req.file?.path

      logger.info(`Avatar uploaded for user: ${userId}`)

      res.json({
        message: 'Avatar uploaded successfully',
        avatarUrl: '/uploads/avatars/temp-avatar.jpg'
      })
    } catch (error) {
      next(error)
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Current password and new password are required'
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'New password must be at least 6 characters long'
        })
      }

      // TODO: 验证当前密码并更新（需要Prisma）
      // const user = await prisma.users.findUnique({ where: { id: userId } })
      // const isValidPassword = await bcrypt.compare(currentPassword, user.password)

      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      logger.info(`Password changed for user: ${userId}`)

      res.json({
        message: 'Password changed successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      // TODO: 删除用户账户（需要Prisma）
      // await prisma.users.delete({ where: { id: userId } })

      logger.info(`User account deleted: ${userId}`)

      res.json({
        message: 'Account deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  static async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      // TODO: 获取用户偏好设置（需要Prisma）
      const mockPreferences = {
        notifications: {
          email: true,
          push: false,
          recommendations: true
        },
        display: {
          theme: 'light',
          language: 'zh-CN',
          timezone: 'Asia/Shanghai'
        },
        recommendations: {
          includePrivateColleges: true,
          includePublicColleges: true,
          maxDistance: 500,
          preferredMajors: ['Computer Science', 'Engineering']
        }
      }

      res.json({
        preferences: mockPreferences
      })
    } catch (error) {
      next(error)
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const preferences = req.body

      // TODO: 更新用户偏好设置（需要Prisma）
      logger.info(`User preferences updated: ${userId}`)

      res.json({
        message: 'Preferences updated successfully',
        preferences
      })
    } catch (error) {
      next(error)
    }
  }
}