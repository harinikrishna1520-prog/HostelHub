import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomNumber: { type: String, required: true },
  hostelBlock: { type: String, required: true },
  category: { type: String, enum: ['Water', 'Electricity', 'Cleaning', 'Bathroom', 'Wi-Fi', 'Furniture', 'Maintenance', 'Other'], required: true },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);