import { Router } from 'express';
import { getStudent, listStudents } from '../controllers/studentController.js';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware, adminMiddleware);
router.get('/', listStudents);
router.get('/:id', getStudent);
export default router;