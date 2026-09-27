const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Room = require('../models/Room');

// @desc    Get all students with search & filter
// @route   GET /api/students
// @access  Private (Admin only)
const getStudents = async (req, res) => {
  try {
    const { search, hostelBlock } = req.query;

    let query = { role: 'student' };

    if (hostelBlock && hostelBlock !== 'All') {
      query.hostelBlock = hostelBlock;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { roomNumber: searchRegex }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('getStudents error:', error);
    res.status(500).json({ message: 'Error fetching students list.' });
  }
};

// @desc    Get single student details with complaints
// @route   GET /api/students/:id
// @access  Private (Admin only)
const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Fetch complaints made by this student
    const complaints = await Complaint.find({ student: student._id }).sort({ createdAt: -1 });

    // Fetch room details
    let room = null;
    if (student.roomNumber && student.hostelBlock) {
      room = await Room.findOne({
        roomNumber: student.roomNumber,
        hostelBlock: student.hostelBlock
      }).populate('occupants', 'name email phone');
    }

    res.json({
      success: true,
      student,
      room,
      complaints
    });
  } catch (error) {
    console.error('getStudentById error:', error);
    res.status(500).json({ message: 'Error fetching student details.' });
  }
};

module.exports = {
  getStudents,
  getStudentById
};
