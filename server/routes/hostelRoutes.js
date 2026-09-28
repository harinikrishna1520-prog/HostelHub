import { Router } from 'express';
import { createHostel, listHostels } from '../controllers/hostelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listHostels);
router.post('/', createHostel);

export default router;
