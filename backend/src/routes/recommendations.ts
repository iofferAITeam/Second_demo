import { Router } from 'express'
import { RecommendationController } from '../controllers/RecommendationController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 获取大学推荐
router.post('/colleges', authenticateToken, RecommendationController.getCollegeRecommendations)

// 获取专业推荐
router.post('/majors', authenticateToken, RecommendationController.getMajorRecommendations)

// 保存推荐结果
router.post('/save', authenticateToken, RecommendationController.saveRecommendation)

// 获取保存的推荐
router.get('/saved', authenticateToken, RecommendationController.getSavedRecommendations)

// 删除保存的推荐
router.delete('/saved/:id', authenticateToken, RecommendationController.deleteSavedRecommendation)

// 获取推荐详情
router.get('/:id', authenticateToken, RecommendationController.getRecommendationDetails)

// 对推荐进行评分
router.post('/:id/rating', authenticateToken, RecommendationController.rateRecommendation)

export default router