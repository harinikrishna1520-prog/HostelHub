import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200, unique: true },
  code: { type: String, required: true, trim: true, uppercase: true, maxlength: 20, unique: true },
  address: { type: String, default: '', trim: true },
  contactEmail: { type: String, default: '', trim: true, lowercase: true },
  contactPhone: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Hostel', hostelSchema);
