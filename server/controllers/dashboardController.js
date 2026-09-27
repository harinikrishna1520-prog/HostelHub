const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');

// @desc    Get Student Dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch user details
    const student = await User.findById(studentId);

    // Fetch student's room if assigned
    let room = null;
    if (student.roomNumber && student.hostelBlock) {
      room = await Room.findOne({
        roomNumber: student.roomNumber,
        hostelBlock: student.hostelBlock
      });
    }

    // Complaint statistics
    const [totalComplaints, pendingComplaints, inProgressComplaints, resolvedComplaints] =
      await Promise.all([
        Complaint.countDocuments({ student: studentId }),
        Complaint.countDocuments({ student: studentId, status: 'Pending' }),
        Complaint.countDocuments({ student: studentId, status: 'In Progress' }),
        Complaint.countDocuments({ student: studentId, status: 'Resolved' })
      ]);

    // Recent 5 complaints submitted by student
    const recentComplaints = await Complaint.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Latest 5 notices for hostel
    const latestNotices = await Notice.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        student: {
          name: student.name,
          email: student.email,
          roomNumber: student.roomNumber,
          hostelBlock: student.hostelBlock
        },
        room,
        stats: {
          total: totalComplaints,
          pending: pendingComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints
        },
        recentComplaints,
        latestNotices
      }
    });
  } catch (error) {
    console.error('getStudentDashboard error:', error);
    res.status(500).json({ message: 'Error retrieving student dashboard data.' });
  }
};

// @desc    Get Admin Dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    // Calculate real numbers from MongoDB
    const [
      totalStudents,
      totalRooms,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Room.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' })
    ]);

    // Room stats: Available, Full, Partially Occupied, Maintenance
    const [availableRooms, fullRooms, occupiedRooms, maintenanceRooms] = await Promise.all([
      Room.countDocuments({ status: 'Available' }),
      Room.countDocuments({ status: 'Full' }),
      Room.countDocuments({ status: 'Partially Occupied' }),
      Room.countDocuments({ status: 'Maintenance' })
    ]);

    // Recent complaints with student name and room
    const recentComplaints = await Complaint.find()
      .populate('student', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent notices
    const recentNotices = await Notice.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalRooms,
          totalComplaints,
          pendingComplaints,
          inProgressComplaints,
          resolvedComplaints,
          roomBreakdown: {
            available: availableRooms,
            full: fullRooms,
            partiallyOccupied: occupiedRooms,
            maintenance: maintenanceRooms
          }
        },
        recentComplaints,
        recentNotices
      }
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    res.status(500).json({ message: 'Error retrieving admin dashboard data.' });
  }
};

module.exports = {
  getStudentDashboard,
  getAdminDashboard
};
