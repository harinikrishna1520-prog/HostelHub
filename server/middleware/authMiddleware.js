import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).populate('hostel');
    if (!user) return res.status(401).json({ message: 'Account not found.' });
    if (payload.hostelId && user.hostel && String(user.hostel._id) !== String(payload.hostelId)) {
      return res.status(401).json({ message: 'This session is invalid for the selected hostel.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}

export function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}