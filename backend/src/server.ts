import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量 (从backend目录)
dotenv.config({ path: path.join(__dirname, '../.env') })

import app from './app'
import { logger } from './utils/logger'

const PORT = process.env.PORT || process.env.BACKEND_PORT || 8000

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 Backend server running on http://localhost:${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`)
      logger.info(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

startServer()