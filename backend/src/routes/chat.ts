import { Router } from 'express'
import { ChatController } from '../controllers/ChatController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 发送消息
router.post('/message', authenticateToken, ChatController.sendMessage)

// 临时测试端点 - 不需要认证
// router.post('/test-message', ChatController.sendMessage)

// 获取聊天历史
router.get('/history', authenticateToken, ChatController.getChatHistory)

// 创建新的聊天会话
router.post('/session', authenticateToken, ChatController.createSession)

// 获取所有聊天会话
router.get('/sessions', authenticateToken, ChatController.getSessions)

// 删除聊天会话
// router.delete('/session/:sessionId', authenticateToken, ChatController.deleteSession)

// 上传文件（为聊天使用）
// router.post('/upload', authenticateToken, ChatController.uploadFile)

// 获取特定会话的消息
// router.get('/session/:sessionId/messages', authenticateToken, ChatController.getSessionMessages)

export default router