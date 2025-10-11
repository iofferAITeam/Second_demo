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
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// 🌐 CORS配置
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://localhost:3002', 
  'http://localhost:3003', 
  'http://localhost:3004', 
  'http://localhost:3005', 
  'http://localhost:3007',
  // 添加生产环境域名
  'http://ec2-3-145-150-161.us-east-2.compute.amazonaws.com:3005',
  'https://ec2-3-145-150-161.us-east-2.compute.amazonaws.com:3005',
  // 允许所有子域名
  /^https?:\/\/.*\.us-east-2\.compute\.amazonaws\.com(:\d+)?$/
]

app.use(cors({
  origin: process.env.FRONTEND_URL || allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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

// 🚫 限流配置（稍后应用，在 token 刷新之后）
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100请求
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set appropriate content type for images
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png')
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg')
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif')
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp')
    }
  }
}))

// 📁 静态文件服务 - 用于提供测试页面
app.use('/public', express.static(path.join(process.cwd(), 'public')))

// 🔄 自动 Token 续期中间件（在限流之前，确保用户能刷新token）
app.use('/api', autoRefreshToken)
app.use('/api', injectTokensInResponse)

// 🚫 应用限流（在 token 刷新之后，避免阻止合法的刷新请求）
app.use('/api', limiter)

// 📋 API路由
app.use('/api', routes)

// 🚫 404处理
app.use(notFoundHandler)

// ❌ 错误处理
app.use(errorHandler)

export default app