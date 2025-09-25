import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'

interface AuthRequest extends Request {
  userId?: string
}

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // 获取用户基本信息和Profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          language: true,
          notifications: true,
          theme: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // 获取详细的Profile信息
      let profile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      // 如果没有Profile，创建一个空的
      if (!profile) {
        profile = await prisma.userProfile.create({
          data: { userId }
        })
      }

      res.json({
        user,
        profile
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      const {
        name,
        phone,
        wechat,
        birthDate,
        nationality,
        currentEducation,
        gpa,
        major,
        graduationDate,
        toefl,
        ielts,
        gre,
        gmat,
        experiences,
        goals
      } = req.body

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // 更新用户基本信息
      if (name) {
        await prisma.user.update({
          where: { id: userId },
          data: { name }
        })
      }

      // 更新或创建UserProfile
      const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: {
          phone,
          wechat,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          nationality,
          currentEducation,
          gpa,
          major,
          graduationDate: graduationDate ? new Date(graduationDate) : undefined,
          toefl,
          ielts,
          gre,
          gmat,
          experiences,
          goals
        },
        create: {
          userId,
          phone,
          wechat,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          nationality,
          currentEducation,
          gpa,
          major,
          graduationDate: graduationDate ? new Date(graduationDate) : undefined,
          toefl,
          ielts,
          gre,
          gmat,
          experiences,
          goals
        }
      })

      // 获取更新后的完整信息
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          language: true,
          notifications: true,
          theme: true
        }
      })

      logger.info(`User profile updated: ${userId}`)

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
        profile
      })
    } catch (error) {
      next(error)
    }
  }

  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId

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
      const userId = req.userId
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
      // const user = await prisma.user.findUnique({ where: { id: userId } })
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
      const userId = req.userId

      // TODO: 删除用户账户（需要Prisma）
      // await prisma.user.delete({ where: { id: userId } })

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
      const userId = req.userId

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
      const userId = req.userId
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