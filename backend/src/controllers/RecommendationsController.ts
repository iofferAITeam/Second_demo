import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export class RecommendationsController {

  // 获取用户最新的AI推荐
  static async getLatestRecommendation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      // 获取最新的AI推荐记录
      const latestRecommendation = await prisma.ai_recommendations.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          recommendation_schools: {
            orderBy: [
              { fitScore: 'desc' },
              { displayOrder: 'asc' }
            ],
            take: 10  // 只返回前10个最佳匹配的学校
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (!latestRecommendation) {
        return res.status(404).json({
          error: 'No AI recommendations found',
          hasRecommendations: false
        })
      }

      // 获取用户资料
      const userProfile = await prisma.user_profiles.findUnique({
        where: { userId }
      })

      res.json({
        success: true,
        hasRecommendations: true,
        recommendation: {
          id: latestRecommendation.id,
          originalQuery: latestRecommendation.originalQuery,
          aiResponse: latestRecommendation.aiResponse,
          teamUsed: latestRecommendation.teamUsed,
          confidence: latestRecommendation.confidence,
          createdAt: latestRecommendation.createdAt,
          totalSchools: latestRecommendation.totalSchools,
          schools: latestRecommendation.recommendation_schools.map(school => ({
            id: school.id,
            name: school.schoolName,
            program: school.programName,
            academic: school.academicScore,
            practical: school.practicalScore,
            language: school.languageScore,
            fit: school.fitScore,
            note: school.strategistNote,
            location: school.location,
            tuition: school.tuition,
            duration: school.duration,
            toefl: school.toeflRequirement,
            admissionRate: school.admissionRate,
            category: school.category,
            schoolType: school.schoolType,
            fitScore: school.fitScore?.toString() || '0',
            fitLabel: getFitLabel(school.fitScore || 0)
          }))
        },
        userProfile: userProfile ? {
          name: req.user?.name || 'Ella Zhao',
          email: req.user?.email,
          gpa: userProfile.gpa,
          major: userProfile.major,
          toefl: userProfile.toefl,
          gre: userProfile.gre,
          nationality: userProfile.nationality || 'China',
          goals: userProfile.goals,
          createdAt: latestRecommendation.createdAt
        } : null
      })

    } catch (error) {
      logger.error('Failed to get AI recommendations:', error)
      next(error)
    }
  }

  // 获取用户所有AI推荐历史
  static async getRecommendationHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { limit = 10, offset = 0 } = req.query

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const recommendations = await prisma.ai_recommendations.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          recommendation_schools: {
            orderBy: {
              displayOrder: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: Number(limit),
        skip: Number(offset)
      })

      const total = await prisma.ai_recommendations.count({
        where: {
          userId,
          isActive: true
        }
      })

      res.json({
        success: true,
        recommendations: recommendations.map(rec => ({
          id: rec.id,
          originalQuery: rec.originalQuery,
          totalSchools: rec.totalSchools,
          teamUsed: rec.teamUsed,
          confidence: rec.confidence,
          createdAt: rec.createdAt,
          schoolCount: rec.recommendation_schools.length
        })),
        total,
        hasMore: (Number(offset) + Number(limit)) < total
      })

    } catch (error) {
      logger.error('Failed to get recommendation history:', error)
      next(error)
    }
  }

  // 获取特定推荐的详细信息
  static async getRecommendationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { recommendationId } = req.params

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const recommendation = await prisma.ai_recommendations.findFirst({
        where: {
          id: recommendationId,
          userId,
          isActive: true
        },
        include: {
          recommendation_schools: {
            orderBy: {
              displayOrder: 'asc'
            }
          }
        }
      })

      if (!recommendation) {
        return res.status(404).json({
          error: 'Recommendation not found'
        })
      }

      res.json({
        success: true,
        recommendation: {
          id: recommendation.id,
          originalQuery: recommendation.originalQuery,
          aiResponse: recommendation.aiResponse,
          teamUsed: recommendation.teamUsed,
          confidence: recommendation.confidence,
          createdAt: recommendation.createdAt,
          totalSchools: recommendation.totalSchools,
          userProfileSnapshot: recommendation.userProfileSnapshot,
          schools: recommendation.recommendation_schools.map(school => ({
            id: school.id,
            name: school.schoolName,
            program: school.programName,
            academic: school.academicScore,
            practical: school.practicalScore,
            language: school.languageScore,
            fit: school.fitScore,
            note: school.strategistNote,
            analysisContent: school.analysisContent,
            location: school.location,
            tuition: school.tuition,
            duration: school.duration,
            toefl: school.toeflRequirement,
            admissionRate: school.admissionRate,
            category: school.category,
            schoolType: school.schoolType
          }))
        }
      })

    } catch (error) {
      logger.error('Failed to get recommendation by ID:', error)
      next(error)
    }
  }
}

// 辅助函数
function getFitLabel(fitScore: number): string {
  if (fitScore >= 5) return "Perfect Fit"
  if (fitScore >= 4) return "High Fit"
  if (fitScore >= 3) return "Good Fit"
  return "Medium Fit"
}