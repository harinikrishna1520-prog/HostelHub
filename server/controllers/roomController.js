import Room from '../models/Room.js';
import User from '../models/User.js';

async function validateOccupants(room) {
  if (room.occupants.length > room.capacity) {
    const error = new Error('Room occupants cannot exceed room capacity.');
    error.status = 400;
    throw error;
  }
  const users = await User.find({ _id: { $in: room.occupants }, role: 'student' });
  if (users.length !== room.occupants.length) {
    const error = new Error('One or more selected residents could not be found.');
    error.status = 400;
    throw error;
  }
  const alreadyAssigned = await Room.findOne({ _id: { $ne: room._id }, occupants: { $in: room.occupants } });
  if (alreadyAssigned) {
    const error = new Error('A selected resident is already assigned to another room.');
    error.status = 409;
    throw error;
  }
}

async function syncOccupants(room, previousRoom = null) {
  const users = await User.find({ _id: { $in: room.occupants }, role: 'student' });
  if (previousRoom) {
    const removedIds = previousRoom.occupants.filter((id) => !room.occupants.some((current) => String(current) === String(id)));
    await User.updateMany({ _id: { $in: removedIds }, roomNumber: previousRoom.roomNumber, hostelBlock: previousRoom.hostelBlock }, { roomNumber: '', hostelBlock: '' });
  }
  await Promise.all(users.map((user) => User.updateOne({ _id: user._id }, { roomNumber: room.roomNumber, hostelBlock: room.hostelBlock })));
}

export async function listRooms(req, res, next) {
  try {
    if (req.user.role === 'student') {
      const room = await Room.findOne({ roomNumber: req.user.roomNumber, hostelBlock: req.user.hostelBlock }).populate('occupants', 'name');
      return res.json(room ? [room] : []);
    }
    const rooms = await Room.find().populate('occupants', 'name email phone roomNumber hostelBlock').sort({ hostelBlock: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) { next(error); }
}

export async function getRoom(req, res, next) {
  try {
    const room = await Room.findById(req.params.id).populate('occupants', 'name email phone roomNumber hostelBlock');
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (req.user.role !== 'admin' && (room.roomNumber !== req.user.roomNumber || room.hostelBlock !== req.user.hostelBlock)) return res.status(403).json({ message: 'You can only view your own room.' });
    res.json(room);
  } catch (error) { next(error); }
}

export async function createRoom(req, res, next) {
  try {
    const room = new Room({ ...req.body, occupants: req.body.occupants || [] });
    await room.validate();
    await validateOccupants(room);
    await room.save();
    await syncOccupants(room);
    res.status(201).json(await room.populate('occupants', 'name email phone roomNumber hostelBlock'));
  } catch (error) { next(error); }
}

export async function updateRoom(req, res, next) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    const previousRoom = { roomNumber: room.roomNumber, hostelBlock: room.hostelBlock, occupants: [...room.occupants] };
    Object.assign(room, req.body);
    await room.validate();
    await validateOccupants(room);
    await room.save();
    await syncOccupants(room, previousRoom);
    res.json(await room.populate('occupants', 'name email phone roomNumber hostelBlock'));
  } catch (error) { next(error); }
}

export async function deleteRoom(req, res, next) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (room.occupants.length) return res.status(409).json({ message: 'Assign occupants to another room before deleting this room.' });
    await room.deleteOne();
    res.json({ message: 'Room deleted.' });
  } catch (error) { next(error); }
}