const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getAdminDashboard
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/student', protect, getStudentDashboard);
router.get('/admin', protect, adminOnly, getAdminDashboard);

module.exports = router;
