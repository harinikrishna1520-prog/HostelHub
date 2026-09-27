const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide notice title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide notice description'],
      trim: true
    },
    category: {
      type: String,
      enum: ['General', 'Maintenance', 'Mess', 'Event', 'Emergency', 'Other'],
      default: 'General'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Notice = mongoose.model('Notice', noticeSchema);
module.exports = Notice;
