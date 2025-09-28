/**
 * 数据库迁移脚本
 * 将用户资料数据从旧结构迁移到新的扩展结构
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '../src/utils/logger'

const prisma = new PrismaClient()

interface OldUserProfile {
  id: string
  userId: string
  phone?: string
  wechat?: string
  birthDate?: Date
  nationality?: string
  currentEducation?: string
  gpa?: number
  major?: string
  graduationDate?: Date
  toefl?: number
  ielts?: number
  gre?: number
  gmat?: number
  experiences?: any
  goals?: string
  createdAt: Date
  updatedAt: Date
}

interface NewUserProfile extends OldUserProfile {
  // 新增字段
  lastTwoYearsGpa?: number
  undergraduateUniversity?: string
  universityRank?: number
  universityType?: string
  toeflDetails?: any
  ieltsDetails?: any
  greDetails?: any
  workExperiences?: any
  internshipExperiences?: any
  researchProjects?: any
  extracurricularActivities?: any
  awards?: any
  recommendationLetters?: any
  programmingSkills?: any
  languageSkills?: any
  targetDegreeType?: string
  targetMajors?: any
  targetCountries?: any
  applicationYear?: string
  applicationTerm?: string
  careerGoals?: string
  personalStatement?: string
  researchInterests?: any
  budgetRange?: string
  scholarshipNeeds?: boolean
  preferredCityType?: string
  climatePreference?: string
  campusSize?: string
  // 推荐模型特征标签
  gpaTag?: number
  paperTag?: number
  toeflTag?: number
  greTag?: number
  researchTag?: number
  collegeTypeTag?: number
  recommendationTag?: number
  networkingTag?: number
  // 计算特征
  hasResearchExperience?: boolean
  publicationCount?: number
  totalWorkMonths?: number
  leadershipScore?: number
  averageGPA?: number
  // 同步状态
  lastSyncAt?: Date
  syncStatus?: string
  syncErrors?: any
}

/**
 * 标准化GPA到4.0制
 */
function normalizeGPA(gpa?: number): number | undefined {
  if (!gpa) return undefined

  // 如果GPA已经是4.0制（<=4.0），直接返回
  if (gpa <= 4.0) return gpa

  // 如果是5.0制，转换为4.0制
  if (gpa <= 5.0) return (gpa / 5.0) * 4.0

  // 如果是100分制，转换为4.0制
  if (gpa <= 100) {
    if (gpa >= 90) return 4.0
    if (gpa >= 85) return 3.7
    if (gpa >= 80) return 3.3
    if (gpa >= 75) return 3.0
    if (gpa >= 70) return 2.7
    if (gpa >= 65) return 2.3
    if (gpa >= 60) return 2.0
    return 1.0
  }

  return gpa // 未知制度，原样返回
}

/**
 * 计算推荐模型tag特征
 */
function calculateTagFeatures(profile: OldUserProfile): Partial<NewUserProfile> {
  const tags: Partial<NewUserProfile> = {}

  // GPA标签
  if (profile.gpa) {
    const normalizedGPA = normalizeGPA(profile.gpa) || profile.gpa
    if (normalizedGPA >= 3.7) tags.gpaTag = 3.0  // 高GPA
    else if (normalizedGPA >= 3.3) tags.gpaTag = 2.0  // 中等GPA
    else tags.gpaTag = 1.0  // 低GPA
  }

  // 语言成绩标签
  if (profile.toefl >= 110 || profile.ielts >= 7.5) tags.toeflTag = 3.0
  else if (profile.toefl >= 100 || profile.ielts >= 6.5) tags.toeflTag = 2.0
  else if (profile.toefl || profile.ielts) tags.toeflTag = 1.0

  // GRE标签
  if (profile.gre >= 325) tags.greTag = 3.0
  else if (profile.gre >= 315) tags.greTag = 2.0
  else if (profile.gre) tags.greTag = 1.0

  // 默认值
  tags.paperTag = 1.0  // 无paper
  tags.researchTag = 0.0  // 无科研经历
  tags.collegeTypeTag = 0.0  // 未知院校类型
  tags.recommendationTag = 0.0  // 无牛推
  tags.networkingTag = 0.0  // 无套磁

  // 计算其他特征
  tags.averageGPA = normalizeGPA(profile.gpa)
  tags.hasResearchExperience = false  // 默认无科研经历
  tags.publicationCount = 0
  tags.totalWorkMonths = 0
  tags.leadershipScore = 0

  // 同步状态
  tags.syncStatus = 'pending'
  tags.lastSyncAt = new Date()

  return tags
}

/**
 * 迁移单个用户资料
 */
async function migrateUserProfile(oldProfile: OldUserProfile): Promise<void> {
  try {
    // 计算新的tag特征
    const newFeatures = calculateTagFeatures(oldProfile)

    // 准备更新数据
    const updateData: Partial<NewUserProfile> = {
      ...newFeatures,
      updatedAt: new Date()
    }

    logger.info(`Migrating profile for user: ${oldProfile.userId}`)

    // 更新用户资料
    await prisma.user_profiles.update({
      where: { userId: oldProfile.userId },
      data: updateData
    })

    logger.info(`✅ Successfully migrated profile for user: ${oldProfile.userId}`)

  } catch (error) {
    logger.error(`❌ Failed to migrate profile for user: ${oldProfile.userId}`, error)
  }
}

/**
 * 创建应用历史记录表的测试数据
 */
async function createSampleApplicationHistory(): Promise<void> {
  try {
    logger.info('Creating sample application history records...')

    // 获取所有用户
    const users = await prisma.users.findMany({
      take: 5, // 只为前5个用户创建样本数据
      include: { user_profiles: true }
    })

    for (const user of users) {
      if (!user.user_profiles) continue

      const profile = user.user_profiles
      const sampleHistory = {
        userId: user.id,
        schoolName: 'Stanford University',
        programName: 'Master of Science in Computer Science',
        applicationYear: '2024',
        result: 'pending',
        profileSnapshot: {
          gpa: profile.gpa,
          toefl: profile.toefl,
          gre: profile.gre,
          major: profile.major,
          university: profile.undergraduateUniversity
        },
        predictionScore: 0.75
      }

      await prisma.user_application_history.create({
        data: sampleHistory
      })

      logger.info(`Created sample application history for user: ${user.id}`)
    }

  } catch (error) {
    logger.error('Failed to create sample application history:', error)
  }
}

/**
 * 主迁移函数
 */
async function main(): Promise<void> {
  try {
    logger.info('🚀 Starting database migration...')
    logger.info('=====================================')

    // 检查数据库连接
    await prisma.$connect()
    logger.info('✅ Database connected successfully')

    // 获取所有现有用户资料
    const userProfiles = await prisma.user_profiles.findMany()
    logger.info(`📊 Found ${userProfiles.length} user profiles to migrate`)

    if (userProfiles.length === 0) {
      logger.info('ℹ️ No user profiles found, creating sample data...')

      // 创建一些示例用户和资料用于测试
      const sampleUser = await prisma.users.create({
        data: {
          id: 'sample_user_001',
          email: 'sample@example.com',
          name: 'Sample User',
          password: 'hashed_password_here'
        }
      })

      await prisma.user_profiles.create({
        data: {
          id: 'profile_sample_001',
          userId: sampleUser.id,
          gpa: 3.8,
          major: '计算机科学',
          toefl: 105,
          gre: 320,
          goals: '申请美国顶尖大学的计算机科学硕士项目'
        }
      })

      logger.info('✅ Sample data created')

      // 重新获取用户资料
      const updatedProfiles = await prisma.user_profiles.findMany()
      logger.info(`📊 Now have ${updatedProfiles.length} user profiles`)
    }

    // 迁移每个用户资料
    let migratedCount = 0
    let errorCount = 0

    for (const profile of userProfiles) {
      try {
        await migrateUserProfile(profile as any)
        migratedCount++
      } catch (error) {
        errorCount++
        logger.error(`Migration failed for profile ${profile.id}:`, error)
      }
    }

    // 创建样本应用历史
    await createSampleApplicationHistory()

    logger.info('=====================================')
    logger.info('📈 Migration Summary:')
    logger.info(`✅ Successfully migrated: ${migratedCount} profiles`)
    logger.info(`❌ Failed migrations: ${errorCount} profiles`)
    logger.info(`📊 Total processed: ${userProfiles.length} profiles`)

    // 验证迁移结果
    logger.info('🔍 Verifying migration results...')

    const updatedProfiles = await prisma.user_profiles.findMany({
      where: {
        gpaTag: { not: null }
      }
    })

    logger.info(`✅ ${updatedProfiles.length} profiles now have calculated tag features`)

    // 显示一些统计信息
    const stats = await prisma.user_profiles.aggregate({
      _count: {
        id: true
      },
      _avg: {
        gpaTag: true,
        toeflTag: true
      }
    })

    logger.info('📊 Migration Statistics:')
    logger.info(`   Total profiles: ${stats._count.id}`)
    logger.info(`   Average GPA tag: ${stats._avg.gpaTag?.toFixed(2) || 'N/A'}`)
    logger.info(`   Average TOEFL tag: ${stats._avg.toeflTag?.toFixed(2) || 'N/A'}`)

    logger.info('🎉 Database migration completed successfully!')

  } catch (error) {
    logger.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行迁移
if (require.main === module) {
  main().catch((error) => {
    logger.error('Migration script error:', error)
    process.exit(1)
  })
}

export { main as runMigration }