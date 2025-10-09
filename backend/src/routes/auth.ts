import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 用户注册
router.post('/register', AuthController.register)

// 用户登录
router.post('/login', AuthController.login)

// 验证令牌 - 使用中间件以支持自动刷新
router.get('/verify', authenticateToken, AuthController.verify)

// 用户登出
router.post('/logout', AuthController.logout)

// 刷新令牌
router.post('/refresh', AuthController.refresh)

// 发送验证邮件
router.post('/send-verification', AuthController.sendVerification)

// 验证邮箱
router.post('/verify-email', AuthController.verifyEmail)

// 忘记密码
router.post('/forgot-password', AuthController.forgotPassword)

// 重置密码
router.post('/reset-password', AuthController.resetPassword)

export default router