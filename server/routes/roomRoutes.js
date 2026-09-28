import { Router } from 'express';
import { createRoom, deleteRoom, getRoom, listRooms, updateRoom } from '../controllers/roomController.js';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listRooms);
router.get('/:id', getRoom);
router.post('/', adminMiddleware, createRoom);
router.put('/:id', adminMiddleware, updateRoom);
router.delete('/:id', adminMiddleware, deleteRoom);
export default router;