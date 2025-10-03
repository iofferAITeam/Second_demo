#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 解析学校推荐数据（与ChatController.ts中的函数相同）
function parseSchoolRecommendations(content) {
  // 更准确的正则表达式，匹配格式："数字. 学校名称 - 项目名称"
  const schoolRegex = /(\d+)\.\s+([^-\n]+?)(?:\s*-\s*([^\n]+?))?\s*\n\*?\s*([\s\S]*?)(?=\n\d+\.\s+[A-Z]|\n---|\n### |$)/g
  let match
  const recommendations = []

  while ((match = schoolRegex.exec(content)) !== null) {
    const id = match[1]
    let schoolName = match[2].trim()
    const programName = match[3] ? match[3].trim() : 'Master of Science in Computer Science'
    const details = match[4]

    // 清理学校名称，移除括号中的内容和额外空格
    schoolName = schoolName.replace(/\s*\([^)]*\)/, '').trim()

    // 跳过非学校条目（如描述性文本）
    if (schoolName.length > 100 || !schoolName.includes('University') && !schoolName.includes('College') && !schoolName.includes('Institute')) {
      continue
    }

    // 提取评分
    const academicMatch = details.match(/Academic Background Score:\s*(\d+(?:\.\d+)?)\/5/)
    const practicalMatch = details.match(/Practical Experience Score:\s*(\d+(?:\.\d+)?)\/5/)
    const languageMatch = details.match(/Language Proficiency Score:\s*(\d+(?:\.\d+)?)\/5/)
    const fitMatch = details.match(/Overall Fit Score:\s*(\d+(?:\.\d+)?)\/5/)
    const noteMatch = details.match(/Strategist's Note:\s*(.*?)(?=\n\d+\.|$)/s)

    // 只有包含评分的才是真正的学校推荐
    if (!academicMatch && !practicalMatch && !languageMatch && !fitMatch) {
      continue
    }

    // 推断学校详细信息
    const schoolInfo = getSchoolInfo(schoolName)

    recommendations.push({
      id,
      schoolName: schoolName,
      programName: programName,
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
function getSchoolInfo(schoolName) {
  const schoolMappings = {
    'Carnegie Mellon University': {
      location: 'Pittsburgh, PA',
      tuition: '$58,924',
      toeflRequirement: '102',
      schoolType: 'One Click Apply'
    },
    'University of California, Berkeley': {
      location: 'Berkeley, CA',
      tuition: '$44,007',
      toeflRequirement: '90',
      schoolType: 'One Click Apply'
    },
    'Stanford University': {
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
    'Georgia Institute of Technology': {
      location: 'Atlanta, GA',
      tuition: '$29,140',
      toeflRequirement: '100',
      schoolType: 'iOffer Cooperation'
    },
    'University of California, Los Angeles': {
      location: 'Los Angeles, CA',
      tuition: '$44,066',
      toeflRequirement: '96',
      schoolType: 'iOffer Cooperation'
    },
    'Cornell University': {
      location: 'Ithaca, NY',
      tuition: '$60,286',
      toeflRequirement: '100',
      schoolType: 'One Click Apply'
    },
    'University of Southern California': {
      location: 'Los Angeles, CA',
      tuition: '$64,726',
      toeflRequirement: '90',
      schoolType: 'iOffer Cooperation'
    },
    'Purdue University': {
      location: 'West Lafayette, IN',
      tuition: '$29,132',
      toeflRequirement: '88',
      schoolType: 'iOffer Cooperation'
    },
    'University of California, Irvine': {
      location: 'Irvine, CA',
      tuition: '$44,007',
      toeflRequirement: '80',
      schoolType: 'iOffer Cooperation'
    },
    'University of Illinois Urbana-Champaign': {
      location: 'Urbana-Champaign, IL',
      tuition: '$34,330',
      toeflRequirement: '103',
      schoolType: 'Regular'
    },
    'Columbia University': {
      location: 'New York, NY',
      tuition: '$60,000',
      toeflRequirement: '100',
      schoolType: 'Regular'
    },
    'New York University': {
      location: 'New York, NY',
      tuition: '$56,500',
      toeflRequirement: '90',
      schoolType: 'Regular'
    },
    'University of California, San Diego': {
      location: 'La Jolla, CA',
      tuition: '$44,007',
      toeflRequirement: '85',
      schoolType: 'Regular'
    },
    'University of Pennsylvania': {
      location: 'Philadelphia, PA',
      tuition: '$58,000',
      toeflRequirement: '100',
      schoolType: 'Regular'
    },
    'Northeastern University': {
      location: 'Boston, MA',
      tuition: '$54,000',
      toeflRequirement: '100',
      schoolType: 'Regular'
    },
    'Arizona State University': {
      location: 'Tempe, AZ',
      tuition: '$31,200',
      toeflRequirement: '88',
      schoolType: 'Regular'
    }
  }

  for (const [key, info] of Object.entries(schoolMappings)) {
    if (schoolName.includes(key) || key.includes(schoolName)) {
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
function getCategoryFromScores(scores) {
  const avgScore = ((scores.academic || 0) + (scores.fit || 0)) / 2
  if (avgScore >= 4.5) return 'target'
  if (avgScore >= 3.5) return 'fit'
  return 'safety'
}

async function fixSchoolNames() {
  try {
    console.log('开始修复学校名称...')

    // 获取Ella的最新AI推荐
    const recommendation = await prisma.ai_recommendations.findFirst({
      where: {
        userId: '8d8529cc-37f5-4222-9ceb-e47cd7f31d1b',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!recommendation) {
      console.log('未找到推荐记录')
      return
    }

    console.log(`找到推荐记录: ${recommendation.id}`)

    // 重新解析AI响应
    const schools = parseSchoolRecommendations(recommendation.aiResponse)
    console.log(`解析出 ${schools.length} 个学校`)

    if (schools.length > 0) {
      // 删除现有的学校记录
      await prisma.ai_recommendation_schools.deleteMany({
        where: {
          recommendationId: recommendation.id
        }
      })

      // 插入修复后的学校记录
      await prisma.ai_recommendation_schools.createMany({
        data: schools.map((school, index) => ({
          recommendationId: recommendation.id,
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
          displayOrder: index + 1
        }))
      })

      // 更新推荐记录的学校总数
      await prisma.ai_recommendations.update({
        where: { id: recommendation.id },
        data: { totalSchools: schools.length }
      })

      console.log('学校名称修复完成！')
      console.log('修复的学校：')
      schools.forEach((school, index) => {
        console.log(`${index + 1}. ${school.schoolName} (${school.category})`)
      })
    }

  } catch (error) {
    console.error('修复学校名称时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSchoolNames()