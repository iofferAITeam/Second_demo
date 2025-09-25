import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import path from 'path'

import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import { autoRefreshToken, injectTokensInResponse } from './middleware/autoRefresh'
import routes from './routes'

const app = express()

// 🔒 安全中间件
app.use(helmet())

// 🌐 CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// 📊 请求日志
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}))

// 📦 中间件
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// 🚫 限流
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100请求
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

// 🩺 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0'
  })
})

// 📁 静态文件服务 - 用于提供上传的文件
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// 🔄 自动 Token 续期中间件
app.use('/api', autoRefreshToken)
app.use('/api', injectTokensInResponse)

// 📋 API路由
app.use('/api', routes)

// 🚫 404处理
app.use(notFoundHandler)

// ❌ 错误处理
app.use(errorHandler)

export default app