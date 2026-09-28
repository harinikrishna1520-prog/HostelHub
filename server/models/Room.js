import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomNumber: { type: String, required: true, trim: true },
  hostelBlock: { type: String, required: true, trim: true },
  floor: { type: Number, required: true, min: 0 },
  roomType: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Available', 'Partially Occupied', 'Full', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

roomSchema.index({ hostel: 1, roomNumber: 1, hostelBlock: 1 }, { unique: true });
roomSchema.pre('save', function () {
  if (this.status !== 'Maintenance') {
    this.status = this.occupants.length === 0 ? 'Available' : this.occupants.length >= this.capacity ? 'Full' : 'Partially Occupied';
  }
});

export default mongoose.model('Room', roomSchema);