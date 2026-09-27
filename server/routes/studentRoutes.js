const express = require('express');
const router = express.Router();
const { getStudents, getStudentById } = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getStudents);
router.get('/:id', protect, adminOnly, getStudentById);

module.exports = router;
