import Complaint from '../models/Complaint.js';
import Room from '../models/Room.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');

export async function createComplaint(req, res, next) {
  try {
    if (!req.body.category || !req.body.description?.trim()) return res.status(400).json({ message: 'Category and description are required.' });
    const complaint = await Complaint.create({
      student: req.user._id,
      roomNumber: req.user.roomNumber,
      hostelBlock: req.user.hostelBlock,
      category: req.body.category,
      description: req.body.description.trim(),
      image: req.file ? req.file.filename : ''
    });
    res.status(201).json(await complaint.populate('student', 'name email phone'));
  } catch (error) { next(error); }
}

export async function listComplaints(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { student: req.user._id };
    for (const key of ['status', 'category', 'hostelBlock']) if (req.query[key]) filter[key] = req.query[key];
    if (req.query.search) {
      const search = String(req.query.search).trim();
      filter.$or = [{ description: { $regex: search, $options: 'i' } }, { roomNumber: { $regex: search, $options: 'i' } }, { hostelBlock: { $regex: search, $options: 'i' } }];
      if (req.user.role === 'admin') {
        const matchingUsers = await (await import('../models/User.js')).default.find({ name: { $regex: search, $options: 'i' } }).select('_id');
        filter.$or.push({ student: { $in: matchingUsers.map((user) => user._id) } });
      }
    }
    const complaints = await Complaint.find(filter).populate('student', 'name email').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) { next(error); }
}

export async function getComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('student', 'name email phone');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
    if (req.user.role !== 'admin' && String(complaint.student._id) !== String(req.user._id)) return res.status(403).json({ message: 'You can only view your own complaints.' });
    res.json(complaint);
  } catch (error) { next(error); }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    if (!statuses.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid complaint status.' });
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }).populate('student', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
    res.json(complaint);
  } catch (error) { next(error); }
}

export async function deleteComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted.' });
  } catch (error) { next(error); }
}

export async function ownRoom(req, res, next) {
  try {
    const room = await Room.findOne({ roomNumber: req.user.roomNumber, hostelBlock: req.user.hostelBlock }).populate('occupants', 'name');
    if (!room) return res.status(404).json({ message: 'Room details are not yet available. Please contact your hostel administrator.' });
    res.json(room);
  } catch (error) { next(error); }
}

export async function getComplaintImage(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id).select('student image');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
    if (req.user.role !== 'admin' && String(complaint.student) !== String(req.user._id)) return res.status(403).json({ message: 'You can only view images attached to your own complaints.' });
    if (!complaint.image) return res.status(404).json({ message: 'This complaint has no image.' });
    res.sendFile(path.join(uploadDirectory, path.basename(complaint.image)));
  } catch (error) { next(error); }
}