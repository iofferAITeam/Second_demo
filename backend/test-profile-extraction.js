const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

async function testProfileExtraction() {
  try {
    console.log('Testing profile extraction functionality...')

    // Check existing users
    const existingUsers = await prisma.users.findMany({
      take: 3,
      include: {
        user_profiles: true
      }
    })

    console.log('Existing users:', existingUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      hasProfile: !!u.user_profiles
    })))

    let testUser = existingUsers[0]

    // Create test user if none exist
    if (!testUser) {
      console.log('Creating test user...')
      const hashedPassword = await bcrypt.hash('testpassword123', 10)

      testUser = await prisma.users.create({
        data: {
          id: 'test-user-profile-' + Date.now(),
          email: 'test@example.com',
          name: '测试用户',
          password: hashedPassword,
          language: 'zh',
          updatedAt: new Date()
        }
      })
      console.log('Created test user:', testUser.id)
    }

    // Test profile creation/update
    console.log('Testing profile upsert...')
    const profileData = {
      gpa: 3.8,
      toefl: 110,
      major: '计算机科学',
      goals: '申请美国研究生项目'
    }

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: testUser.id },
      create: {
        id: `profile_${testUser.id}`,
        userId: testUser.id,
        ...profileData,
        updatedAt: new Date()
      },
      update: {
        ...profileData,
        updatedAt: new Date()
      }
    })

    console.log('Profile saved successfully:', {
      userId: updatedProfile.userId,
      gpa: updatedProfile.gpa,
      toefl: updatedProfile.toefl,
      major: updatedProfile.major
    })

    // Test profile retrieval
    const retrievedProfile = await prisma.userProfile.findUnique({
      where: { userId: testUser.id }
    })

    console.log('Profile retrieved:', {
      found: !!retrievedProfile,
      gpa: retrievedProfile?.gpa,
      toefl: retrievedProfile?.toefl,
      major: retrievedProfile?.major
    })

    console.log('✅ Profile extraction test completed successfully')
    console.log('Test user ID for API testing:', testUser.id)

    return testUser.id

  } catch (error) {
    console.error('❌ Profile extraction test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testProfileExtraction().catch(console.error)