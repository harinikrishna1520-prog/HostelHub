import User from '../models/User.js';

export async function listStudents(req, res, next) {
  try {
    const search = String(req.query.search || '').trim();
    const filter = { role: 'student' };
    if (req.query.block) filter.hostelBlock = req.query.block;
    if (search) filter.$or = ['name', 'email', 'phone', 'roomNumber'].map((key) => ({ [key]: { $regex: search, $options: 'i' } }));
    const students = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) { next(error); }
}

export async function getStudent(req, res, next) {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (error) { next(error); }
}