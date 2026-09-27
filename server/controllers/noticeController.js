const Notice = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private (All authenticated users)
const getNotices = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const notices = await Notice.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notices.length,
      notices
    });
  } catch (error) {
    console.error('getNotices error:', error);
    res.status(500).json({ message: 'Error retrieving notices.' });
  }
};

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Private
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('createdBy', 'name');
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }
    res.json({ success: true, notice });
  } catch (error) {
    console.error('getNoticeById error:', error);
    res.status(500).json({ message: 'Error retrieving notice.' });
  }
};

// @desc    Create notice (Admin only)
// @route   POST /api/notices
// @access  Private (Admin only)
const createNotice = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      createdBy: req.user._id
    });

    const populated = await Notice.findById(notice._id).populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Notice published successfully!',
      notice: populated
    });
  } catch (error) {
    console.error('createNotice error:', error);
    res.status(500).json({ message: 'Error publishing notice.' });
  }
};

// @desc    Update notice (Admin only)
// @route   PUT /api/notices/:id
// @access  Private (Admin only)
const updateNotice = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    if (title) notice.title = title.trim();
    if (description) notice.description = description.trim();
    if (category) notice.category = category;

    const updated = await notice.save();
    const populated = await Notice.findById(updated._id).populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Notice updated successfully!',
      notice: populated
    });
  } catch (error) {
    console.error('updateNotice error:', error);
    res.status(500).json({ message: 'Error updating notice.' });
  }
};

// @desc    Delete notice (Admin only)
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notice deleted successfully.'
    });
  } catch (error) {
    console.error('deleteNotice error:', error);
    res.status(500).json({ message: 'Error deleting notice.' });
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
};
