import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { authenticateToken } from '../middleware/auth'
import { uploadAvatar, handleUploadError } from '../middleware/upload'

const router = Router()

// 获取用户个人信息
router.get('/profile', authenticateToken, UserController.getProfile)

// 更新用户个人信息
router.put('/profile', authenticateToken, UserController.updateProfile)

// 上传头像
router.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), handleUploadError, UserController.uploadAvatar)

// 更改密码
router.put('/password', authenticateToken, UserController.changePassword)

// 删除账户
router.delete('/account', authenticateToken, UserController.deleteAccount)

// 获取用户偏好设置
router.get('/preferences', authenticateToken, UserController.getPreferences)

// 更新用户偏好设置
router.put('/preferences', authenticateToken, UserController.updatePreferences)

export default router