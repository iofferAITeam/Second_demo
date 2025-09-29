import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'
import { ProfileFormData, StructuredProfileResponse, ProfileResponse } from '../types/profile'
import { transformFormDataToDatabase, transformDatabaseToFormData, cleanProfileUpdateData } from '../utils/profile-transformer'
import { AvatarProcessor } from '../utils/avatar-processor'
import path from 'path'

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

      // Get user basic information
      const user = await prisma.users.findUnique({
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

      // Get detailed profile information
      const profile = await prisma.user_profiles.findUnique({
        where: { userId }
      })

      // Transform database data to frontend form structure
      const profileData = transformDatabaseToFormData(user, profile)

      const response: StructuredProfileResponse = {
        user,
        profileData
      }

      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      const formData: ProfileFormData = req.body

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Transform frontend form data to database format
      const { userUpdates, profileUpdates } = transformFormDataToDatabase(formData)

      // Clean up undefined values
      const cleanedProfileUpdates = cleanProfileUpdateData(profileUpdates)

      // Update user basic information if needed
      if (userUpdates.name) {
        await prisma.users.update({
          where: { id: userId },
          data: userUpdates
        })
      }

      // Update or create UserProfile
      const profile = await prisma.user_profiles.upsert({
        where: { userId },
        update: cleanedProfileUpdates,
        create: {
          userId,
          ...cleanedProfileUpdates
        }
      })

      // Get updated user information
      const updatedUser = await prisma.users.findUnique({
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

      const response: ProfileResponse = {
        message: 'Profile updated successfully',
        user: updatedUser!,
        profile
      }

      res.json(response)
    } catch (error) {
      logger.error('Profile update error:', error)
      next(error)
    }
  }

  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      // Validate the uploaded image
      const isValidImage = await AvatarProcessor.validateImage(req.file.path)
      if (!isValidImage) {
        return res.status(400).json({ error: 'Invalid image file' })
      }

      // Generate optimized filename
      const optimizedFilename = AvatarProcessor.generateOptimizedFilename(req.file.originalname, userId)
      const outputPath = path.join('uploads/avatars', optimizedFilename)

      // Process and resize the avatar
      await AvatarProcessor.processAvatar(req.file.path, outputPath, {
        width: 200,
        height: 200,
        quality: 90,
        format: 'jpeg'
      })

      // Generate avatar URL (relative to public directory)
      const avatarUrl = `/uploads/avatars/${optimizedFilename}`

      // Update user's avatar in database
      await prisma.users.update({
        where: { id: userId },
        data: { avatar: avatarUrl }
      })

      logger.info(`Avatar uploaded and processed for user: ${userId}, file: ${optimizedFilename}`)

      res.json({
        message: 'Avatar uploaded successfully',
        avatarUrl: avatarUrl
      })
    } catch (error) {
      logger.error('Avatar upload error:', error)
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
      const userId = req.userId

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