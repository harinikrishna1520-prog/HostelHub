import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

export async function studentDashboard(req, res, next) {
  try {
    const [counts, recentComplaints, latestNotices, room] = await Promise.all([
      Complaint.aggregate([{ $match: { student: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(5),
      Notice.find().sort({ createdAt: -1 }).limit(4),
      Room.findOne({ roomNumber: req.user.roomNumber, hostelBlock: req.user.hostelBlock })
    ]);
    const statistics = { total: 0, pending: 0, inProgress: 0, resolved: 0 };
    for (const item of counts) {
      statistics.total += item.count;
      if (item._id === 'Pending') statistics.pending = item.count;
      if (item._id === 'In Progress') statistics.inProgress = item.count;
      if (item._id === 'Resolved') statistics.resolved = item.count;
    }
    res.json({ statistics, recentComplaints, latestNotices, room });
  } catch (error) { next(error); }
}

export async function adminDashboard(req, res, next) {
  try {
    const [totalStudents, totalRooms, totalComplaints, complaintCounts, recentComplaints, recentNotices] = await Promise.all([
      User.countDocuments({ role: 'student' }), Room.countDocuments(), Complaint.countDocuments(),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.find().populate('student', 'name').sort({ createdAt: -1 }).limit(6),
      Notice.find().sort({ createdAt: -1 }).limit(4)
    ]);
    const byStatus = { Pending: 0, 'In Progress': 0, Resolved: 0 };
    complaintCounts.forEach(({ _id, count }) => { if (_id in byStatus) byStatus[_id] = count; });
    res.json({ statistics: { totalStudents, totalRooms, totalComplaints, pending: byStatus.Pending, inProgress: byStatus['In Progress'], resolved: byStatus.Resolved }, recentComplaints, recentNotices });
  } catch (error) { next(error); }
}