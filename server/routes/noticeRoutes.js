const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getNotices);
router.get('/:id', protect, getNoticeById);
router.post('/', protect, adminOnly, createNotice);
router.put('/:id', protect, adminOnly, updateNotice);
router.delete('/:id', protect, adminOnly, deleteNotice);

module.exports = router;
