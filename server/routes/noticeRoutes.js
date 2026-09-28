import { Router } from 'express';
import { createNotice, deleteNotice, listNotices, updateNotice } from '../controllers/noticeController.js';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listNotices);
router.post('/', adminMiddleware, createNotice);
router.put('/:id', adminMiddleware, updateNotice);
router.delete('/:id', adminMiddleware, deleteNotice);
export default router;