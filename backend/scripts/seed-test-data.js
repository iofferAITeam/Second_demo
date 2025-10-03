const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始创建测试数据...')

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 12)

  const testUser = await prisma.users.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      language: 'zh',
      notifications: true,
      theme: 'light',
      updatedAt: new Date()
    }
  })

  console.log('✅ 测试用户创建成功:', testUser.email)

  // 创建用户资料
  const userProfile = await prisma.user_profiles.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      id: `profile_${testUser.id}`,
      userId: testUser.id,
      gpa: 3.8,
      major: 'Computer Science',
      toefl: 105,
      gre: 325,
      nationality: 'China',
      goals: 'Master degree in Computer Science at top US university',
      currentEducation: 'Bachelor degree',
      graduationYear: '2024',
      targetDegreeType: 'masters',
      applicationYear: '2025',
      applicationTerm: 'fall',
      updatedAt: new Date()
    }
  })

  console.log('✅ 用户资料创建成功:', userProfile.major)

  // 创建AI推荐记录
  const aiRecommendation = await prisma.ai_recommendations.upsert({
    where: { id: 'test-recommendation-id' },
    update: {},
    create: {
      id: 'test-recommendation-id',
      userId: testUser.id,
      originalQuery: 'Please recommend some CS master programs for me. My GPA is 3.8, TOEFL 105, GRE 325.',
      queryType: 'school_recommendation',
      aiResponse: `Based on your excellent academic profile, here are my top recommendations:

1. Stanford University
Academic Background Score: 4/5
Practical Experience Score: 4/5
Language Proficiency Score: 5/5
Overall Fit Score: 4/5
Strategist's Note: Excellent match for your profile. Strong CS program with great research opportunities.

2. UC Berkeley
Academic Background Score: 4/5
Practical Experience Score: 4/5
Language Proficiency Score: 5/5
Overall Fit Score: 4/5
Strategist's Note: Top public university with strong CS department and good value.

3. Carnegie Mellon
Academic Background Score: 5/5
Practical Experience Score: 4/5
Language Proficiency Score: 5/5
Overall Fit Score: 5/5
Strategist's Note: Best CS program in the world. Perfect fit for your background.`,
      teamUsed: 'SCHOOL_RECOMMENDATION',
      confidence: 0.95,
      thinkingProcess: 'Analyzed user profile with GPA 3.8, TOEFL 105, GRE 325 for CS masters programs',
      strategy: 'Recommend mix of reach, target, and safety schools',
      source: 'AI recommendation engine',
      recommendedSchools: [
        {
          name: 'Stanford University',
          scores: { academic: 4, practical: 4, language: 5, fit: 4 },
          category: 'target'
        },
        {
          name: 'UC Berkeley',
          scores: { academic: 4, practical: 4, language: 5, fit: 4 },
          category: 'target'
        },
        {
          name: 'Carnegie Mellon',
          scores: { academic: 5, practical: 4, language: 5, fit: 5 },
          category: 'target'
        }
      ],
      totalSchools: 3,
      userProfileSnapshot: {
        gpa: 3.8,
        major: 'Computer Science',
        toefl: 105,
        gre: 325,
        nationality: 'China',
        goals: 'Master degree in Computer Science'
      }
    }
  })

  console.log('✅ AI推荐记录创建成功:', aiRecommendation.id)

  // 创建推荐学校详情
  const schools = [
    {
      id: 'stanford-rec',
      schoolName: 'Stanford University',
      academicScore: 4.0,
      practicalScore: 4.0,
      languageScore: 5.0,
      fitScore: 4.0,
      strategistNote: 'Excellent match for your profile. Strong CS program with great research opportunities.',
      location: 'Stanford, CA',
      tuition: '$58,416',
      duration: '2 years',
      toeflRequirement: '100',
      admissionRate: '15-25%',
      category: 'target',
      schoolType: 'One Click Apply',
      displayOrder: 1
    },
    {
      id: 'berkeley-rec',
      schoolName: 'UC Berkeley',
      academicScore: 4.0,
      practicalScore: 4.0,
      languageScore: 5.0,
      fitScore: 4.0,
      strategistNote: 'Top public university with strong CS department and good value.',
      location: 'Berkeley, CA',
      tuition: '$44,007',
      duration: '2 years',
      toeflRequirement: '90',
      admissionRate: '15-25%',
      category: 'target',
      schoolType: 'One Click Apply',
      displayOrder: 2
    },
    {
      id: 'cmu-rec',
      schoolName: 'Carnegie Mellon',
      academicScore: 5.0,
      practicalScore: 4.0,
      languageScore: 5.0,
      fitScore: 5.0,
      strategistNote: 'Best CS program in the world. Perfect fit for your background.',
      location: 'Pittsburgh, PA',
      tuition: '$58,924',
      duration: '2 years',
      toeflRequirement: '102',
      admissionRate: '15-25%',
      category: 'target',
      schoolType: 'One Click Apply',
      displayOrder: 3
    }
  ]

  for (const school of schools) {
    await prisma.ai_recommendation_schools.upsert({
      where: { id: school.id },
      update: {},
      create: {
        ...school,
        recommendationId: aiRecommendation.id
      }
    })
    console.log('✅ 学校推荐创建成功:', school.schoolName)
  }

  console.log('🎉 所有测试数据创建完成!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 错误:', e)
    await prisma.$disconnect()
    process.exit(1)
  })