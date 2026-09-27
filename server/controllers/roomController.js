const Room = require('../models/Room');
const User = require('../models/User');

// Helper function to update Room status based on occupants and capacity
const recalculateRoomStatus = (room) => {
  if (room.status === 'Maintenance') {
    return 'Maintenance';
  }
  const count = room.occupants ? room.occupants.length : 0;
  if (count === 0) return 'Available';
  if (count >= room.capacity) return 'Full';
  return 'Partially Occupied';
};

// @desc    Get all rooms (Admin can filter by block, status, search)
// @route   GET /api/rooms
// @access  Private (Admin or Authenticated)
const getRooms = async (req, res) => {
  try {
    const { hostelBlock, status, search } = req.query;

    let query = {};

    if (hostelBlock && hostelBlock !== 'All') {
      query.hostelBlock = hostelBlock;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.roomNumber = new RegExp(search.trim(), 'i');
    }

    const rooms = await Room.find(query)
      .populate('occupants', 'name email phone')
      .sort({ hostelBlock: 1, roomNumber: 1 });

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error('getRooms error:', error);
    res.status(500).json({ message: 'Error retrieving rooms.' });
  }
};

// @desc    Get current student's room
// @route   GET /api/rooms/my-room
// @access  Private (Student)
const getMyRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.roomNumber || !user.hostelBlock) {
      return res.status(404).json({
        message: 'No room assigned to your profile yet. Please contact hostel administration.'
      });
    }

    const room = await Room.findOne({
      roomNumber: user.roomNumber,
      hostelBlock: user.hostelBlock
    }).populate('occupants', 'name email phone roomNumber hostelBlock');

    if (!room) {
      return res.json({
        success: true,
        room: {
          roomNumber: user.roomNumber,
          hostelBlock: user.hostelBlock,
          floor: 1,
          roomType: 'Standard',
          capacity: 2,
          occupants: [
            {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone
            }
          ],
          status: 'Partially Occupied'
        },
        notice: 'Room record is automatically derived from your student registration profile.'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('getMyRoom error:', error);
    res.status(500).json({ message: 'Error retrieving student room details.' });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private (Admin)
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('occupants', 'name email phone');
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    res.json({ success: true, room });
  } catch (error) {
    console.error('getRoomById error:', error);
    res.status(500).json({ message: 'Error retrieving room.' });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin)
const createRoom = async (req, res) => {
  try {
    const { roomNumber, hostelBlock, floor, roomType, capacity, status } = req.body;

    if (!roomNumber || !hostelBlock || !capacity) {
      return res.status(400).json({ message: 'Room number, hostel block, and capacity are required.' });
    }

    // Check if room number already exists in this hostel block
    const existing = await Room.findOne({
      roomNumber: roomNumber.trim(),
      hostelBlock: hostelBlock.trim()
    });

    if (existing) {
      return res.status(400).json({
        message: `Room ${roomNumber} already exists in ${hostelBlock}.`
      });
    }

    const room = new Room({
      roomNumber: roomNumber.trim(),
      hostelBlock: hostelBlock.trim(),
      floor: Number(floor) || 1,
      roomType: roomType || 'Double',
      capacity: Number(capacity) || 2,
      occupants: [],
      status: status || 'Available'
    });

    room.status = recalculateRoomStatus(room);
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully!',
      room
    });
  } catch (error) {
    console.error('createRoom error:', error);
    res.status(500).json({ message: error.message || 'Error creating room.' });
  }
};

// @desc    Update room details or assign occupants
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const { roomNumber, hostelBlock, floor, roomType, capacity, status, occupants } = req.body;

    if (roomNumber) room.roomNumber = roomNumber.trim();
    if (hostelBlock) room.hostelBlock = hostelBlock.trim();
    if (floor !== undefined) room.floor = Number(floor);
    if (roomType) room.roomType = roomType;
    if (capacity !== undefined) room.capacity = Number(capacity);

    // If occupants array passed, update occupants and sync student records
    if (Array.isArray(occupants)) {
      room.occupants = occupants;

      // Update student profiles with roomNumber and hostelBlock
      await User.updateMany(
        { _id: { $in: occupants } },
        { roomNumber: room.roomNumber, hostelBlock: room.hostelBlock }
      );
    }

    if (status) {
      room.status = status;
    } else {
      room.status = recalculateRoomStatus(room);
    }

    const updatedRoom = await room.save();
    const populated = await Room.findById(updatedRoom._id).populate('occupants', 'name email phone');

    res.json({
      success: true,
      message: 'Room updated successfully!',
      room: populated
    });
  } catch (error) {
    console.error('updateRoom error:', error);
    res.status(500).json({ message: error.message || 'Error updating room.' });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Unassign occupants
    if (room.occupants && room.occupants.length > 0) {
      await User.updateMany(
        { _id: { $in: room.occupants } },
        { roomNumber: '', hostelBlock: '' }
      );
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room deleted successfully.'
    });
  } catch (error) {
    console.error('deleteRoom error:', error);
    res.status(500).json({ message: 'Error deleting room.' });
  }
};

module.exports = {
  getRooms,
  getMyRoom,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
