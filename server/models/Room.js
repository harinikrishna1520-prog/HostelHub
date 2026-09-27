const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      trim: true
    },
    hostelBlock: {
      type: String,
      required: [true, 'Please provide hostel block'],
      trim: true
    },
    floor: {
      type: Number,
      required: [true, 'Please provide floor number'],
      default: 1
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      default: 'Double'
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide room capacity'],
      min: [1, 'Capacity must be at least 1'],
      default: 2
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['Available', 'Partially Occupied', 'Full', 'Maintenance'],
      default: 'Available'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of roomNumber within a hostelBlock
roomSchema.index({ roomNumber: 1, hostelBlock: 1 }, { unique: true });

// Auto-calculate status before save
roomSchema.pre('save', function (next) {
  if (this.status !== 'Maintenance') {
    const occCount = this.occupants ? this.occupants.length : 0;
    if (occCount === 0) {
      this.status = 'Available';
    } else if (occCount >= this.capacity) {
      this.status = 'Full';
    } else {
      this.status = 'Partially Occupied';
    }
  }
  next();
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
