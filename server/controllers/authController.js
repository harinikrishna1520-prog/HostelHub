import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Hostel from '../models/Hostel.js';
import User from '../models/User.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  hostelId: user.hostel ? (user.hostel._id || user.hostel) : null,
  hostel: user.hostel ? {
    _id: user.hostel._id || user.hostel,
    name: user.hostel.name,
    code: user.hostel.code,
    address: user.hostel.address
  } : null,
  roomNumber: user.roomNumber,
  hostelBlock: user.hostelBlock,
  createdAt: user.createdAt
});

function issueToken(user) {
  return jwt.sign({
    id: user._id.toString(),
    role: user.role,
    hostelId: (user.hostel && user.hostel.toString ? user.hostel.toString() : user.hostel)
  }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res, next) {
  try {
    const hostelId = req.body.hostel || req.body.hostelId;
    const { name, email, phone, password, roomNumber, hostelBlock } = req.body;
    if (![name, email, phone, password, roomNumber, hostelBlock].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Please complete every registration field.' });
    }
    if (!hostelId) return res.status(400).json({ message: 'Please select a hostel.' });
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return res.status(404).json({ message: 'Selected hostel does not exist.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: 'An account with that email already exists.' });
    const user = await User.create({
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 12),
      roomNumber,
      hostelBlock,
      hostel: hostel._id,
      role: 'student'
    });
    const populated = await user.populate('hostel');
    res.status(201).json({ token: issueToken(populated), user: publicUser(populated) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() }).populate('hostel').select('+password');
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export function me(req, res) { res.json({ user: publicUser(req.user) }); }