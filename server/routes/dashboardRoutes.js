import { Router } from 'express';
import { adminDashboard, studentDashboard } from '../controllers/dashboardController.js';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/student', studentDashboard);
router.get('/admin', adminMiddleware, adminDashboard);
export default router;