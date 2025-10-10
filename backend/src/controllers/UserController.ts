import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
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
      let userId = req.userId

      // Check for API key authentication (AI service to backend)
      const apiKey = req.headers['x-api-key']
      if (apiKey === process.env.AI_SERVICE_API_KEY) {
        userId = req.query.user_id as string
        if (!userId) {
          return res.status(400).json({ error: 'user_id query parameter required for API key auth' })
        }
      }

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
      const userForTransform = {
        ...user,
        avatar: user.avatar || undefined
      }
      const profileForTransform = profile ? {
        ...profile,
        phone: profile.phone || undefined,
        wechat: profile.wechat || undefined,
        birthDate: profile.birthDate || undefined,
        nationality: profile.nationality || undefined,
        currentEducation: profile.currentEducation || undefined,
        gpa: profile.gpa || undefined,
        major: profile.major || undefined,
        graduationDate: profile.graduationDate || undefined,
        goals: profile.goals || undefined
      } : null
      const profileData = transformDatabaseToFormData(userForTransform, profileForTransform)

      const response: StructuredProfileResponse = {
        user: userForTransform,
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
        update: {
          ...cleanedProfileUpdates,
          updatedAt: new Date()
        },
        create: {
          id: crypto.randomUUID(),
          userId,
          ...cleanedProfileUpdates,
          updatedAt: new Date()
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
        user: {
          ...updatedUser!,
          avatar: updatedUser!.avatar || undefined
        },
        profile: {
          id: profile.id,
          userId: profile.userId,
          phone: profile.phone || undefined,
          wechat: profile.wechat || undefined,
          birthDate: profile.birthDate || undefined,
          nationality: profile.nationality || undefined,
          currentEducation: profile.currentEducation || undefined,
          gpa: profile.gpa || undefined,
          major: profile.major || undefined,
          graduationDate: profile.graduationDate || undefined,
          goals: profile.goals || undefined,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
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

  static async getCompetitiveness(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Get user profile data
      const profile = await prisma.user_profiles.findUnique({
        where: { userId },
        select: {
          gpa: true,
          languageTestsData: true,
          standardizedTestsData: true,
          researchExperience: true,
          workExperiences: true,
          internshipExperiences: true,
          extracurricularActivities: true,
          awards: true,
          recommendationLetters: true,
          publications: true,
          totalWorkMonths: true,
          leadershipScore: true,
          publicationCount: true,
          hasResearchExperience: true,
          gpaTag: true,
          paperTag: true,
          toeflTag: true,
          greTag: true,
          researchTag: true,
          collegeTypeTag: true,
          recommendationTag: true,
          networkingTag: true
        }
      })

      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' })
      }

      // Calculate competitiveness scores for each dimension
      const scores = calculateCompetitivenessScores(profile)

      res.json({
        overallScore: scores.overallScore,
        chartData: scores.chartData,
        breakdown: scores.breakdown
      })
    } catch (error) {
      logger.error('Get competitiveness error:', error)
      next(error)
    }
  }
}

// Helper function to calculate competitiveness scores
function calculateCompetitivenessScores(profile: any) {
  // Academic Performance (GPA)
  const academicScore = calculateAcademicScore(profile.gpa)

  // Research Experience
  const researchScore = calculateResearchScore(
    profile.hasResearchExperience,
    profile.publicationCount,
    profile.researchExperience
  )

  // Work & Internship Experience
  const workScore = calculateWorkScore(
    profile.totalWorkMonths,
    profile.workExperiences,
    profile.internshipExperiences
  )

  // Extracurricular Activities
  const extracurricularScore = calculateExtracurricularScore(
    profile.extracurricularActivities,
    profile.awards,
    profile.leadershipScore
  )

  // Standardized Test Scores
  const testScore = calculateTestScore(
    profile.languageTestsData,
    profile.standardizedTestsData
  )

  // Recommendation Letters
  const recommendationScore = calculateRecommendationScore(
    profile.recommendationLetters
  )

  const chartData = [
    { label: "Academic Performance", value: academicScore, color: "#1890ff" },
    { label: "Research Experience", value: researchScore, color: "#52c41a" },
    { label: "Internship & Work Experience", value: workScore, color: "#faad14" },
    { label: "Extracurriculars", value: extracurricularScore, color: "#f5222d" },
    { label: "Standardized Test Score", value: testScore, color: "#722ed1" },
    { label: "Recommendation letters", value: recommendationScore, color: "#13c2c2" }
  ]

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (academicScore * 0.25 +
     researchScore * 0.20 +
     workScore * 0.20 +
     extracurricularScore * 0.15 +
     testScore * 0.15 +
     recommendationScore * 0.05)
  )

  return {
    overallScore,
    chartData,
    breakdown: {
      academic: academicScore,
      research: researchScore,
      work: workScore,
      extracurricular: extracurricularScore,
      test: testScore,
      recommendation: recommendationScore
    }
  }
}

function calculateAcademicScore(gpa: number | null): number {
  if (!gpa) return 50

  // Convert GPA to 0-100 scale
  if (gpa >= 3.8) return 95
  if (gpa >= 3.5) return 85
  if (gpa >= 3.2) return 75
  if (gpa >= 3.0) return 65
  if (gpa >= 2.7) return 55
  return 45
}

function calculateResearchScore(hasResearch: boolean | null, publicationCount: number | null, researchExp: string | null): number {
  let score = 50

  if (hasResearch) score += 20
  if (publicationCount && publicationCount > 0) score += publicationCount * 10
  if (researchExp && researchExp.trim().length > 0) score += 15

  return Math.min(score, 100)
}

function calculateWorkScore(totalMonths: number | null, workExp: any, internshipExp: any): number {
  let score = 50

  if (totalMonths && totalMonths > 0) {
    score += Math.min(totalMonths * 2, 30)
  }

  if (workExp && Array.isArray(workExp) && workExp.length > 0) {
    score += workExp.length * 5
  }

  if (internshipExp && Array.isArray(internshipExp) && internshipExp.length > 0) {
    score += internshipExp.length * 3
  }

  return Math.min(score, 100)
}

function calculateExtracurricularScore(activities: any, awards: any, leadershipScore: number | null): number {
  let score = 50

  if (activities && Array.isArray(activities) && activities.length > 0) {
    score += activities.length * 5
  }

  if (awards && Array.isArray(awards) && awards.length > 0) {
    score += awards.length * 8
  }

  if (leadershipScore && leadershipScore > 0) {
    score += leadershipScore * 10
  }

  return Math.min(score, 100)
}

function calculateTestScore(languageTestsData: any, standardizedTestsData: any): number {
  let score = 50

  // Parse language tests (TOEFL, IELTS)
  if (languageTestsData && Array.isArray(languageTestsData)) {
    for (const test of languageTestsData) {
      const testScore = parseFloat(test.score)
      if (test.testType === 'toefl') {
        if (testScore >= 110) score += 25
        else if (testScore >= 100) score += 20
        else if (testScore >= 90) score += 15
        else if (testScore >= 80) score += 10
      } else if (test.testType === 'ielts') {
        if (testScore >= 8.0) score += 25
        else if (testScore >= 7.5) score += 20
        else if (testScore >= 7.0) score += 15
        else if (testScore >= 6.5) score += 10
      }
    }
  }

  // Parse standardized tests (GRE, GMAT)
  if (standardizedTestsData && Array.isArray(standardizedTestsData)) {
    for (const test of standardizedTestsData) {
      const testScore = parseFloat(test.score)
      if (test.testType === 'gre') {
        if (testScore >= 330) score += 20
        else if (testScore >= 320) score += 15
        else if (testScore >= 310) score += 10
        else if (testScore >= 300) score += 5
      } else if (test.testType === 'gmat') {
        if (testScore >= 700) score += 20
        else if (testScore >= 650) score += 15
        else if (testScore >= 600) score += 10
        else if (testScore >= 550) score += 5
      }
    }
  }

  return Math.min(score, 100)
}

function calculateRecommendationScore(recommendations: any): number {
  if (!recommendations || !Array.isArray(recommendations)) return 60

  let score = 60
  score += recommendations.length * 10

  return Math.min(score, 100)
}