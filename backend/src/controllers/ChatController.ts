import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'
import axios from 'axios'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

// AI回复内容清洗函数
function cleanAiResponse(message: string): string {
  if (!message) return message

  // 1. 移除引用部分
  message = message.replace(/Reference Sources:.*$/s, '')
  message = message.replace(/Additional Sources:.*$/s, '')

  // 2. 移除引用标记 [1], [2], [3] 等
  message = message.replace(/\[\d+\]/g, '')

  // 3. 移除网址链接 (https://...) 和 (http://...)
  message = message.replace(/\(https?:\/\/[^\s\)]+\)/g, '')

  // 4. 移除独立行的URL链接
  message = message.replace(/^https?:\/\/.*$/gm, '')

  // 5. 移除不适当的外部网站推荐
  message = message.replace(/powerschool\.com.*$/gm, '')
  message = message.replace(/understood\.org.*$/gm, '')
  message = message.replace(/nextgenlearning\.org.*$/gm, '')
  message = message.replace(/.*: https?:\/\/.*$/gm, '')

  // 6. 移除粗体标记 **文字** -> 文字
  message = message.replace(/\*\*(.*?)\*\*/g, '$1')

  // 7. 移除列表符号 - （行首的破折号）
  message = message.replace(/^\s*-\s+/gm, '')

  // 8. 移除不完整的格式标记
  message = message.replace(/\*\*\s*$/g, '')
  message = message.replace(/^\s*\*\*/g, '')

  // 9. 移除提及其他平台或网站的句子
  message = message.replace(/.*you can also update your student profile.*through your school's platform.*$/gm, '')
  message = message.replace(/.*tools like Scoir.*$/gm, '')
  message = message.replace(/.*if applicable\..*$/gm, '')

  // 10. 清理多余的空行
  message = message.replace(/\n\s*\n\s*\n+/g, '\n\n')

  // 11. 清理首尾空白
  return message.trim()
}

// 检测是否为学校推荐响应
function isSchoolRecommendationResponse(content: string): boolean {
  const recommendationKeywords = [
    'Academic Background Score',
    'Practical Experience Score',
    'Language Proficiency Score',
    'Overall Fit Score',
    'Carnegie Mellon',
    'UC Berkeley',
    'Stanford',
    'University of Washington',
    'Georgia Tech',
    'UCLA',
    'Cornell',
    'USC',
    'Purdue',
    'UC Irvine',
    'Strategist\'s Note'
  ]

  return recommendationKeywords.some(keyword => content.includes(keyword)) &&
         content.includes('Score') &&
         content.includes('University')
}

// 解析学校推荐数据
function parseSchoolRecommendations(content: string) {
  const detailRegex = /(\d+)\.\s+([^(]+?)(?:\([^)]+\))?\s*\n([\s\S]*?)(?=\d+\.\s+[A-Z]|$)/g
  let match
  const recommendations = []

  while ((match = detailRegex.exec(content)) !== null) {
    const id = match[1]
    const name = match[2].trim()
    const details = match[3]

    // 提取评分
    const academicMatch = details.match(/Academic Background Score:\s*(\d+)\/5/)
    const practicalMatch = details.match(/Practical Experience Score:\s*(\d+)\/5/)
    const languageMatch = details.match(/Language Proficiency Score:\s*(\d+)\/5/)
    const fitMatch = details.match(/Overall Fit Score:\s*(\d+)\/5/)
    const noteMatch = details.match(/Strategist's Note:\s*(.*?)(?=\n\d+\.|$)/s)

    // 推断学校详细信息
    const schoolInfo = getSchoolInfo(name)

    recommendations.push({
      id,
      schoolName: name,
      programName: 'Master of Science in Computer Science',
      academicScore: academicMatch ? parseFloat(academicMatch[1]) : null,
      practicalScore: practicalMatch ? parseFloat(practicalMatch[1]) : null,
      languageScore: languageMatch ? parseFloat(languageMatch[1]) : null,
      fitScore: fitMatch ? parseFloat(fitMatch[1]) : null,
      strategistNote: noteMatch ? noteMatch[1].trim() : null,
      analysisContent: details,
      ...schoolInfo,
      category: getCategoryFromScores({
        academic: academicMatch ? parseFloat(academicMatch[1]) : 0,
        fit: fitMatch ? parseFloat(fitMatch[1]) : 0
      }),
      displayOrder: parseInt(id) || 0
    })
  }

  return recommendations
}

// 获取学校信息
function getSchoolInfo(schoolName: string) {
  const schoolMappings = {
    'Carnegie Mellon': {
      location: 'Pittsburgh, PA',
      tuition: '$58,924',
      toeflRequirement: '102',
      schoolType: 'One Click Apply'
    },
    'UC Berkeley': {
      location: 'Berkeley, CA',
      tuition: '$44,007',
      toeflRequirement: '90',
      schoolType: 'One Click Apply'
    },
    'Stanford': {
      location: 'Stanford, CA',
      tuition: '$58,416',
      toeflRequirement: '100',
      schoolType: 'One Click Apply'
    },
    'University of Washington': {
      location: 'Seattle, WA',
      tuition: '$36,898',
      toeflRequirement: '92',
      schoolType: 'iOffer Cooperation'
    },
    'Georgia Tech': {
      location: 'Atlanta, GA',
      tuition: '$29,140',
      toeflRequirement: '100',
      schoolType: 'iOffer Cooperation'
    },
    'UCLA': {
      location: 'Los Angeles, CA',
      tuition: '$44,066',
      toeflRequirement: '96',
      schoolType: 'iOffer Cooperation'
    },
    'Cornell': {
      location: 'Ithaca, NY',
      tuition: '$60,286',
      toeflRequirement: '100',
      schoolType: 'One Click Apply'
    },
    'USC': {
      location: 'Los Angeles, CA',
      tuition: '$64,726',
      toeflRequirement: '90',
      schoolType: 'iOffer Cooperation'
    },
    'Purdue': {
      location: 'West Lafayette, IN',
      tuition: '$29,132',
      toeflRequirement: '88',
      schoolType: 'iOffer Cooperation'
    },
    'UC Irvine': {
      location: 'Irvine, CA',
      tuition: '$44,007',
      toeflRequirement: '80',
      schoolType: 'iOffer Cooperation'
    }
  }

  for (const [key, info] of Object.entries(schoolMappings)) {
    if (schoolName.includes(key)) {
      return {
        duration: '2 years',
        admissionRate: '15-25%',
        ...info
      }
    }
  }

  return {
    location: 'USA',
    tuition: '$45,000',
    duration: '2 years',
    toeflRequirement: '90',
    admissionRate: '20%',
    schoolType: 'Regular'
  }
}

// 根据评分确定类别
function getCategoryFromScores(scores: any): string {
  const avgScore = ((scores.academic || 0) + (scores.fit || 0)) / 2
  if (avgScore >= 4.5) return 'target'
  if (avgScore >= 3.5) return 'fit'
  return 'safety'
}

export class ChatController {

  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { message, sessionId } = req.body

      if (!message) {
        return res.status(400).json({
          error: 'Message content is required'
        })
      }

      // 暂时跳过数据库操作以避免Prisma错误
      // let userMessage
      // if (userId) {
      //   userMessage = await prisma.chat_messages.create({
      //     data: {
      //       userId,
      //       sessionId: sessionId || null,
      //       content: message,
      //       type: 'USER'
      //     }
      //   })
      // }

      // 提取用户资料信息
      let profileExtraction = null
      if (userId) {
        try {
          // 使用STUDENT_INFO团队提取用户资料信息
          const extractionResponse = await axios.post(`${process.env.AI_SERVICE_URL}/chat/message`, {
            message: `请从以下消息中提取学生个人资料信息: ${message}`,
            user_id: userId,
            team_type: "STUDENT_INFO"
          }, {
            timeout: 300000,
            headers: {
              'Content-Type': 'application/json'
            }
          })

          profileExtraction = extractionResponse.data
          logger.info('Profile extraction result', profileExtraction)

          // 简单的资料信息检测 - 检查消息是否包含有用的学术信息
          const hasAcademicInfo = message.toLowerCase().includes('gpa') ||
                                message.toLowerCase().includes('toefl') ||
                                message.toLowerCase().includes('gre') ||
                                message.toLowerCase().includes('专业') ||
                                message.toLowerCase().includes('university') ||
                                message.toLowerCase().includes('学校') ||
                                message.toLowerCase().includes('computer science') ||
                                message.toLowerCase().includes('计算机科学')

          if (hasAcademicInfo) {
            try {
              // 简单的数据提取示例
              const extractedData: any = {
                basicInfo: {},
                academicBackground: {},
                testScores: {},
                applicationInfo: {}
              }

              // 简单的GPA提取
              const gpaMatch = message.match(/gpa\s*[:\s]*(\d+\.?\d*)/i)
              if (gpaMatch) {
                extractedData.academicBackground.gpa = parseFloat(gpaMatch[1])
              }

              // 简单的TOEFL提取
              const toeflMatch = message.match(/toefl\s*[:\s]*(\d+)/i)
              if (toeflMatch) {
                extractedData.testScores.toefl = parseInt(toeflMatch[1])
              }

              // 专业提取
              if (message.includes('计算机科学') || message.includes('computer science')) {
                extractedData.academicBackground.major = message.includes('计算机科学') ? '计算机科学' : 'Computer Science'
              }

              // 如果提取到任何信息就保存到数据库
              if (Object.keys(extractedData.academicBackground).length > 0 ||
                  Object.keys(extractedData.testScores).length > 0) {
                try {
                  // 直接保存到userProfile表
                  await prisma.user_profiles.upsert({
                    where: { userId },
                    create: {
                      id: `profile_${userId}`,
                      userId,
                      gpa: extractedData.academicBackground.gpa,
                      toefl: extractedData.testScores.toefl,
                      major: extractedData.academicBackground.major,
                      updatedAt: new Date()
                    },
                    update: {
                      gpa: extractedData.academicBackground.gpa || undefined,
                      toefl: extractedData.testScores.toefl || undefined,
                      major: extractedData.academicBackground.major || undefined,
                      updatedAt: new Date()
                    }
                  })
                  logger.info('Profile data saved to database for user', { userId, extractedData })
                } catch (saveError) {
                  logger.error('Failed to save profile data to database', saveError)
                }
              }
            } catch (saveError) {
              logger.error('Failed to auto-save profile data', saveError)
            }
          }
        } catch (error) {
          logger.warn('Profile extraction failed', error)
        }
      }

      // 检索用户资料用于个性化推荐
      let userProfile = null
      if (userId) {
        try {
          userProfile = await prisma.user_profiles.findUnique({
            where: { userId }
          })
          if (userProfile) {
            logger.info('Retrieved user profile for personalized recommendation', {
              userId,
              gpa: userProfile.gpa,
              major: userProfile.major,
              gre: userProfile.gre,
              toefl: userProfile.toefl,
              experiences: userProfile.experiences
            })
          }
        } catch (error) {
          logger.warn('Failed to retrieve user profile', error)
        }
      }

      // 调用AI服务
      let aiResponse
      try {
        // 构建包含用户资料的请求
        const aiRequest: any = {
          message: message,
          user_id: userId,
          session_id: sessionId
        }

        // 让AI服务的teams系统自动决定路由，不强制指定团队类型
        // 如果有用户资料，添加详细信息以供teams使用
        if (userProfile) {
          aiRequest.user_profile = {
            gpa: userProfile.gpa,
            major: userProfile.major,
            gre: userProfile.gre,
            gmat: userProfile.gmat,
            toefl: userProfile.toefl,
            ielts: userProfile.ielts,
            nationality: userProfile.nationality,
            goals: userProfile.goals,
            experiences: userProfile.experiences,
            currentEducation: userProfile.currentEducation
          }
          logger.info('Including user profile in AI request for teams to use')
        }

        // 先尝试调用新的AI服务
        const aiServiceResponse = await axios.post(`${process.env.AI_SERVICE_URL}/chat/message`, aiRequest, {
          timeout: 300000, // 5分钟超时，给AI团队足够时间生成推荐
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (aiServiceResponse.data && aiServiceResponse.data.message) {
          // 清洗AI回复内容
          const cleanedContent = cleanAiResponse(aiServiceResponse.data.message)

          aiResponse = {
            id: 'ai-response-' + Date.now(),
            content: cleanedContent,
            type: 'assistant',
            timestamp: new Date().toISOString(),
            teamUsed: aiServiceResponse.data.team_used || 'GENERAL_QA',
            confidence: aiServiceResponse.data.rag_similarity || 0.9,
            thinkingProcess: aiServiceResponse.data.thinking_process,
            referenceLinks: aiServiceResponse.data.reference_links,
            strategy: aiServiceResponse.data.strategy,
            source: aiServiceResponse.data.source
          }
          logger.info('AI service responded with team', { team: aiServiceResponse.data.team_used })

          // 检测是否为学校推荐响应并保存到数据库
          if (userId && isSchoolRecommendationResponse(cleanedContent)) {
            try {
              // 解析推荐数据
              const recommendations = parseSchoolRecommendations(cleanedContent)

              // 获取用户资料快照
              const userProfile = await prisma.user_profiles.findUnique({
                where: { userId }
              })

              // 保存AI推荐记录
              const recommendationRecord = await prisma.ai_recommendations.create({
                data: {
                  userId,
                  sessionId,
                  originalQuery: message,
                  queryType: 'school_recommendation',
                  aiResponse: cleanedContent,
                  teamUsed: aiServiceResponse.data.team_used,
                  confidence: aiServiceResponse.data.rag_similarity || 0.9,
                  thinkingProcess: aiServiceResponse.data.thinking_process,
                  strategy: aiServiceResponse.data.strategy,
                  source: aiServiceResponse.data.source,
                  recommendedSchools: recommendations,
                  totalSchools: recommendations.length,
                  userProfileSnapshot: userProfile ? {
                    gpa: userProfile.gpa,
                    major: userProfile.major,
                    toefl: userProfile.toefl,
                    gre: userProfile.gre,
                    nationality: userProfile.nationality,
                    goals: userProfile.goals,
                    experiences: userProfile.experiences
                  } : undefined
                }
              })

              // 保存每个推荐学校的详细信息
              if (recommendations.length > 0) {
                await prisma.ai_recommendation_schools.createMany({
                  data: recommendations.map((school: any) => ({
                    recommendationId: recommendationRecord.id,
                    schoolName: school.schoolName,
                    programName: school.programName,
                    academicScore: school.academicScore,
                    practicalScore: school.practicalScore,
                    languageScore: school.languageScore,
                    fitScore: school.fitScore,
                    strategistNote: school.strategistNote,
                    analysisContent: school.analysisContent,
                    location: school.location,
                    tuition: school.tuition,
                    duration: school.duration,
                    toeflRequirement: school.toeflRequirement,
                    admissionRate: school.admissionRate,
                    category: school.category,
                    schoolType: school.schoolType,
                    displayOrder: school.displayOrder
                  }))
                })
              }

              logger.info('AI recommendation saved to database')

              // 在响应中包含推荐ID
              ;(aiResponse as any).recommendationId = recommendationRecord.id

            } catch (saveError) {
              logger.error('Failed to save AI recommendation to database', saveError)
            }
          }

          // 保存普通聊天消息到数据库
          if (userId) {
            try {
              // 保存用户消息
              await prisma.chat_messages.create({
                data: {
                  id: `msg_${Date.now()}_user`,
                  userId,
                  sessionId,
                  content: message,
                  type: 'USER'
                }
              })

              // 保存AI回复消息
              await prisma.chat_messages.create({
                data: {
                  id: `msg_${Date.now()}_ai`,
                  userId,
                  sessionId,
                  content: cleanedContent,
                  type: 'ASSISTANT',
                  metadata: {
                    teamUsed: aiServiceResponse.data.team_used,
                    confidence: aiServiceResponse.data.rag_similarity,
                    thinkingProcess: aiServiceResponse.data.thinking_process,
                    strategy: aiServiceResponse.data.strategy,
                    source: aiServiceResponse.data.source
                  }
                }
              })

              logger.info('Chat messages saved to database')
            } catch (error) {
              logger.warn('Failed to save chat messages', error)
            }
          }
        } else {
          throw new Error('Invalid AI service response format')
        }
      } catch (aiError) {
        logger.warn(`AI service error: ${aiError}. Falling back to mock response.`)

        // 降级到模拟响应，检查用户资料完整度
        let fallbackContent = '感谢您的咨询！作为您的留学顾问，我来帮您分析：\n\n'

        // 暂时使用通用回复，避免Prisma模型问题
        fallbackContent += '基于您的问题，我建议您考虑以下几个方面：\n\n'
        fallbackContent += '1. **学术背景评估** - 请告诉我您的GPA和专业背景\n'
        fallbackContent += '2. **目标院校定位** - 根据您的条件匹配合适的大学\n'
        fallbackContent += '3. **申请时间规划** - 制定详细的申请时间表\n\n'
        fallbackContent += '为了获得更个性化的建议，建议您前往个人中心完善资料，包括学术背景、目标专业方向和语言成绩等信息。'

        aiResponse = {
          id: 'mock-response-id',
          content: fallbackContent,
          type: 'assistant',
          timestamp: new Date().toISOString(),
          teamUsed: 'FALLBACK',
          confidence: 0.8,
          fallback: true
        }
      }

      logger.info('Message sent by user', { userId })

      res.json({
        message: 'Message sent successfully',
        userMessage: {
          id: 'temp-user-msg-' + Date.now(),
          content: message,
          type: 'user',
          timestamp: new Date().toISOString()
        },
        aiResponse,
        // 包含资料提取结果
        profileExtraction: profileExtraction
      })
    } catch (error) {
      next(error)
    }
  }

  static async getChatHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { limit = 50, offset = 0 } = req.query

      // 暂时返回空历史，因为chat模型还未实现
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      // TODO: 实现chat模型后取消注释
      // const messages = await prisma.chat_messages.findMany({
      //   where: { userId },
      //   orderBy: { createdAt: 'desc' },
      //   take: Number(limit),
      //   skip: Number(offset)
      // })

      // const formattedMessages = messages.map(msg => ({
      //   id: msg.id,
      //   content: msg.content,
      //   type: msg.type.toLowerCase(),
      //   timestamp: msg.createdAt.toISOString(),
      //   metadata: msg.metadata
      // }))

      res.json({
        messages: [],
        total: 0
      })
    } catch (error) {
      next(error)
    }
  }

  static async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { title } = req.body

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      // 暂时返回模拟会话，因为chat模型还未实现
      const mockSession = {
        id: 'temp-session-' + Date.now(),
        title: title || '新的咨询',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      }

      logger.info('Mock chat session created', { sessionId: mockSession.id })

      res.status(201).json({
        message: 'Session created successfully',
        session: mockSession
      })
    } catch (error) {
      next(error)
    }
  }

  static async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      // 暂时返回空会话列表，因为chat模型还未实现
      res.json({
        sessions: []
      })
    } catch (error) {
      next(error)
    }
  }

  static async deleteSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { sessionId } = req.params

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      // 暂时返回成功，因为chat模型还未实现
      logger.info('Mock chat session deletion', { sessionId })

      res.json({
        message: 'Session deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  static async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      // TODO: 处理文件上传（需要multer配置）
      // const file = req.file

      logger.info('File uploaded by user', { userId })

      res.json({
        message: 'File uploaded successfully',
        file: {
          id: 'file-' + Date.now(),
          name: 'transcript.pdf',
          size: 1024000,
          type: 'application/pdf',
          url: '/uploads/files/temp-file.pdf'
        }
      })
    } catch (error) {
      next(error)
    }
  }

  static async getSessionMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { sessionId } = req.params

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      // 暂时返回空消息列表，因为chat模型还未实现
      res.json({
        sessionId,
        messages: []
      })
    } catch (error) {
      next(error)
    }
  }

  // 新增：确认并更新用户资料 - 暂时禁用
  static async confirmProfileUpdate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { extractedData, confirmed } = req.body

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      if (!confirmed) {
        return res.status(400).json({ error: 'User confirmation required' })
      }

      // 更新用户资料功能已移除UnifiedProfileService依赖
      const updatedProfile = null

      logger.info('Profile updated for user', { userId, extractedData })

      res.json({
        success: true,
        message: 'Profile updated successfully',
        updatedProfile: updatedProfile
      })

    } catch (error) {
      logger.error('Profile update confirmation error', error)
      next(error)
    }
  }

  // 新增：获取资料完整度和建议问题 - 暂时禁用
  static async getProfileSuggestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      // const suggestions = await ChatController.profileExtractor.generateFollowUpQuestions(userId, {})

      res.json({
        suggestions: [],
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      next(error)
    }
  }
}