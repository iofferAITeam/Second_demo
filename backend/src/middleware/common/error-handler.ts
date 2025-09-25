import { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'

export interface ApiError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500
  let message = error.message

  // Prisma错误处理
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400
    message = 'Database operation failed'
  }

  // JWT错误处理
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  // 验证错误处理
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = error.message
  }

  // 记录错误
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
  } else {
    logger.warn('Client Error:', {
      message: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip
    })
  }

  // 生产环境不暴露详细错误信息
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'Internal server error'
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}