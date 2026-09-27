const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Notice = require('../models/Notice');
const Complaint = require('../models/Complaint');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelhub';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Connected successfully.');

    // 1. Seed or update Admin User
    const adminEmail = 'admin@hostelhub.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: 'Chief Hostel Warden',
        email: adminEmail,
        password: 'admin123', // Will be hashed by pre-save hook
        phone: '+91 98765 43210',
        role: 'admin',
        hostelBlock: 'Administration',
        roomNumber: 'Warden Office'
      });
      console.log(`[Seed] Created Admin account: ${adminEmail} (password: admin123)`);
    } else {
      console.log(`[Seed] Admin account already exists: ${adminEmail}`);
    }

    // 2. Seed Sample Student if none exists
    const studentEmail = 'student@hostelhub.com';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Alex Johnson',
        email: studentEmail,
        password: 'student123',
        phone: '+91 91234 56789',
        role: 'student',
        roomNumber: '101',
        hostelBlock: 'Block A'
      });
      console.log(`[Seed] Created Demo Student account: ${studentEmail} (password: student123)`);
    }

    // 3. Seed Rooms
    const sampleRooms = [
      { roomNumber: '101', hostelBlock: 'Block A', floor: 1, roomType: 'Double', capacity: 2, occupants: [student._id] },
      { roomNumber: '102', hostelBlock: 'Block A', floor: 1, roomType: 'Double', capacity: 2, occupants: [] },
      { roomNumber: '103', hostelBlock: 'Block A', floor: 1, roomType: 'Single', capacity: 1, occupants: [] },
      { roomNumber: '201', hostelBlock: 'Block A', floor: 2, roomType: 'Triple', capacity: 3, occupants: [] },
      { roomNumber: '202', hostelBlock: 'Block A', floor: 2, roomType: 'Double', capacity: 2, occupants: [] },
      { roomNumber: '101', hostelBlock: 'Block B', floor: 1, roomType: 'Double', capacity: 2, occupants: [] },
      { roomNumber: '102', hostelBlock: 'Block B', floor: 1, roomType: 'Single', capacity: 1, occupants: [] },
      { roomNumber: '201', hostelBlock: 'Block B', floor: 2, roomType: 'Triple', capacity: 3, occupants: [] },
      { roomNumber: '101', hostelBlock: 'Block C', floor: 1, roomType: 'Dormitory', capacity: 4, occupants: [] }
    ];

    for (const r of sampleRooms) {
      const exists = await Room.findOne({ roomNumber: r.roomNumber, hostelBlock: r.hostelBlock });
      if (!exists) {
        await Room.create(r);
      }
    }
    console.log('[Seed] Sample rooms ensured.');

    // 4. Seed Notices
    const sampleNotices = [
      {
        title: 'Scheduled Water Supply Maintenance',
        description: 'Please note that overhead tank cleaning and maintenance is scheduled for tomorrow between 10:00 AM and 1:00 PM. Please store sufficient water.',
        category: 'Maintenance',
        createdBy: admin._id
      },
      {
        title: 'Revision in Dining Hall Timings',
        description: 'Effective this Monday, dinner will be served from 7:30 PM to 9:30 PM. All students are requested to adhere to the revised schedule.',
        category: 'Mess',
        createdBy: admin._id
      },
      {
        title: 'Hostel Wi-Fi Network Upgrade',
        description: 'New 5GHz access points have been installed across Block A and Block B. Please report any connectivity dead zones to the complaint desk.',
        category: 'General',
        createdBy: admin._id
      },
      {
        title: 'Emergency Medical Inspection Protocol',
        description: 'The campus doctor will be available at the dispensary daily from 4:00 PM to 7:00 PM. Emergency contacts are posted in the reception hall.',
        category: 'Emergency',
        createdBy: admin._id
      }
    ];

    for (const n of sampleNotices) {
      const exists = await Notice.findOne({ title: n.title });
      if (!exists) {
        await Notice.create(n);
      }
    }
    console.log('[Seed] Sample notices ensured.');

    // 5. Seed sample complaint for demonstration if none
    const existingComplaint = await Complaint.findOne({ student: student._id });
    if (!existingComplaint) {
      await Complaint.create({
        student: student._id,
        roomNumber: '101',
        hostelBlock: 'Block A',
        category: 'Water',
        description: 'Bathroom tap is dripping continuously and leaking on the floor.',
        status: 'In Progress'
      });
      await Complaint.create({
        student: student._id,
        roomNumber: '101',
        hostelBlock: 'Block A',
        category: 'Wi-Fi',
        description: 'Weak Wi-Fi signal coverage near bed 2.',
        status: 'Pending'
      });
      console.log('[Seed] Sample complaints created.');
    }

    console.log('\n=========================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Default Admin Credentials:');
    console.log(' Email:    admin@hostelhub.com');
    console.log(' Password: admin123');
    console.log(' Default Student Credentials:');
    console.log(' Email:    student@hostelhub.com');
    console.log(' Password: student123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
