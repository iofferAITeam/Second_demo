import { Router } from 'express'
import authRoutes from './auth'
import userRoutes from './user'
import chatRoutes from './chat'
import recommendationRoutes from './recommendations'

const router = Router()

// 🔐 认证路由
router.use('/auth', authRoutes)

// 👤 用户路由
router.use('/user', userRoutes)

// 💬 聊天路由
router.use('/chat', chatRoutes)

// 🎓 推荐路由
router.use('/recommendations', recommendationRoutes)

// 📁 上传路由 - 暂时禁用
// router.use('/upload', uploadRoutes)

// 📋 API信息
router.get('/', (req, res) => {
  res.json({
    message: 'College Recommendation API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      chat: '/api/chat',
      recommendations: '/api/recommendations'
    },
    docs: '/api/docs' // TODO: 添加Swagger文档
  })
})

export default router