import { Request, Response, NextFunction } from 'express'
import { AUTH, HTTP_STATUS, ERROR_MESSAGES } from '../constants'

// 验证注册请求
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body

  // 检查必填字段
  if (!email || !password || !name) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.MISSING_FIELDS
    })
  }

  // 验证密码长度
  if (password.length < AUTH.PASSWORD_MIN_LENGTH) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.PASSWORD_TOO_SHORT
    })
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Invalid email format'
    })
  }

  next()
}

// 验证登录请求
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Email and password are required'
    })
  }

  next()
}