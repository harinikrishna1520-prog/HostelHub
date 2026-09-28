import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomNumber: { type: String, default: '' },
  hostelBlock: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);