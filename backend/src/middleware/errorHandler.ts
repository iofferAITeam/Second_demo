import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("Server Error:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Resource already exists',
      details: 'A record with this information already exists'
    })
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
      details: 'The requested resource was not found'
    })
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      details: 'The provided token is invalid'
    })
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      details: 'The provided token has expired'
    })
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.message
    })
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? error.stack : 'Something went wrong on our end'
  })
}