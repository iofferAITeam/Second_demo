import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 检查是否已经有用户数据
  const existingUser = await prisma.user_profiles.findFirst()

  if (existingUser) {
    console.log('ℹ️  Database already contains data, skipping seed')
    return
  }

  // 创建Ella的用户档案（如果不存在）
  const ellaProfile = await prisma.user_profiles.upsert({
    where: { userId: '8d8529cc-37f5-4222-9ceb-e47cd7f31d1b' },
    update: {},
    create: {
      id: 'profile_8d8529cc-37f5-4222-9ceb-e47cd7f31d1b',
      userId: '8d8529cc-37f5-4222-9ceb-e47cd7f31d1b',
      gpa: 3.8,
      major: '计算机科学',
      nationality: 'China',
      languageTestsData: [{ testType: 'toefl', score: '105', date: '2024-01-01' }],
      standardizedTestsData: [{ testType: 'gre', score: '320', date: '2024-02-01' }],
      goals: 'Pursue a Master\'s degree in Computer Science and work in the tech industry',
      updatedAt: new Date()
    }
  })

  console.log('✅ Created user profile:', ellaProfile)

  // 创建一些示例聊天会话
  const chatSession = await prisma.chat_sessions.create({
    data: {
      id: 'sample_session_' + Date.now(),
      userId: '8d8529cc-37f5-4222-9ceb-e47cd7f31d1b',
      title: '学校推荐咨询',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  console.log('✅ Created chat session:', chatSession)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })