const express = require('express');
const router = express.Router();
const {
  getRooms,
  getMyRoom,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/my-room', protect, getMyRoom);
router.get('/', protect, getRooms);
router.post('/', protect, adminOnly, createRoom);
router.get('/:id', protect, getRoomById);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;
