import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in server/.env first.');
const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) throw new Error('Usage: npm run seed:admin -- "Admin Name" admin@example.com "strong-password"');
if (password.length < 12) throw new Error('Admin password must be at least 12 characters.');
await mongoose.connect(process.env.MONGO_URI);
const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) throw new Error('An account with that email already exists.');
const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), phone: 'N/A', role: 'admin' });
console.log(`Administrator created: ${user.email}`);
await mongoose.disconnect();