import { Router } from 'express'
import { RecommendationsController } from '../controllers/RecommendationsController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 获取最新AI推荐
router.get('/latest', authenticateToken, RecommendationsController.getLatestRecommendation)

// 获取推荐历史
router.get('/history', authenticateToken, RecommendationsController.getRecommendationHistory)

// 获取特定推荐详情
router.get('/:recommendationId', authenticateToken, RecommendationsController.getRecommendationById)

export default router