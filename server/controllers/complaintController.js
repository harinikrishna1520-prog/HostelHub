const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Create a new complaint (Student)
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res) => {
  try {
    const { category, description, roomNumber } = req.body;

    if (!category || !description) {
      return res.status(400).json({ message: 'Category and description are required.' });
    }

    const studentUser = await User.findById(req.user._id);

    // Use passed roomNumber or fallback to student's registered roomNumber
    const assignedRoom = roomNumber || studentUser.roomNumber;
    const assignedBlock = studentUser.hostelBlock || 'Block A';

    if (!assignedRoom) {
      return res.status(400).json({
        message: 'Room number is required. Please set your room number in your profile.'
      });
    }

    // Image filename from Multer
    let image = '';
    if (req.file) {
      image = req.file.filename;
    }

    const complaint = await Complaint.create({
      student: req.user._id,
      roomNumber: assignedRoom,
      hostelBlock: assignedBlock,
      category,
      description,
      image,
      status: 'Pending'
    });

    const populated = await Complaint.findById(complaint._id).populate(
      'student',
      'name email phone roomNumber hostelBlock'
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint: populated
    });
  } catch (error) {
    console.error('createComplaint error:', error);
    res.status(500).json({ message: error.message || 'Error submitting complaint.' });
  }
};

// @desc    Get complaints (Student gets own, Admin gets all)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const { status, category, hostelBlock, search } = req.query;

    let query = {};

    // Role-based scoping: Students only get their own complaints
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    // Filters
    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (hostelBlock && hostelBlock !== 'All' && req.user.role === 'admin') {
      query.hostelBlock = hostelBlock;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { description: searchRegex },
        { category: searchRegex },
        { roomNumber: searchRegex }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'name email phone roomNumber hostelBlock')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('getComplaints error:', error);
    res.status(500).json({ message: 'Error retrieving complaints.' });
  }
};

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'student',
      'name email phone roomNumber hostelBlock'
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Authorization: student can only view their own complaint
    if (
      req.user.role === 'student' &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this complaint.' });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('getComplaintById error:', error);
    res.status(500).json({ message: 'Error retrieving complaint details.' });
  }
};

// @desc    Update complaint status (Admin only)
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin only)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = status;
    // Mongoose timestamps will automatically update updatedAt
    await complaint.save();

    const populated = await Complaint.findById(complaint._id).populate(
      'student',
      'name email phone roomNumber hostelBlock'
    );

    res.json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      complaint: populated
    });
  } catch (error) {
    console.error('updateComplaintStatus error:', error);
    res.status(500).json({ message: 'Error updating complaint status.' });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin or Student if pending)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Check authorization
    if (req.user.role === 'student') {
      if (complaint.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this complaint.' });
      }
      if (complaint.status !== 'Pending') {
        return res.status(400).json({
          message: 'Cannot delete a complaint that is already In Progress or Resolved.'
        });
      }
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully.'
    });
  } catch (error) {
    console.error('deleteComplaint error:', error);
    res.status(500).json({ message: 'Error deleting complaint.' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
};
