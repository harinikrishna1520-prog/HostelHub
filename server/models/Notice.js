import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, enum: ['General', 'Maintenance', 'Mess', 'Event', 'Emergency', 'Other'], default: 'General' },
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Notice', noticeSchema);