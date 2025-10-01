const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function generateTestToken() {
  try {
    console.log('Setting up test user for profile extraction testing...')

    // Create or find test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10)

    const testUser = await prisma.users.upsert({
      where: { email: 'test-profile@example.com' },
      create: {
        id: 'test-user-profile-' + Date.now(),
        email: 'test-profile@example.com',
        name: '测试用户',
        password: hashedPassword,
        language: 'zh',
        updatedAt: new Date()
      },
      update: {
        updatedAt: new Date()
      }
    })

    console.log('Test user:', {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name
    })

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'
    const token = jwt.sign(
      {
        userId: testUser.id,
        email: testUser.email,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('✅ Test setup completed')
    console.log('Bearer token:', token)
    console.log('\nTest curl command:')
    console.log(`curl -X POST http://localhost:8001/api/chat/send-message \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "message": "你好，我是计算机科学专业的学生，GPA 3.8，TOEFL 110分，想申请美国的研究生项目，请给我推荐一些学校。",
    "sessionId": "test-session-profile"
  }'`)

    return { user: testUser, token }

  } catch (error) {
    console.error('❌ Test setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

generateTestToken().catch(console.error)