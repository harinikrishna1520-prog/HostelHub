import Hostel from '../models/Hostel.js';

export async function listHostels(req, res, next) {
  try {
    const hostels = await Hostel.find().sort({ name: 1 });
    res.json(hostels);
  } catch (error) { next(error); }
}

export async function createHostel(req, res, next) {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });

    const { name, code, address, contactEmail, contactPhone } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'Hostel name and code are required.' });

    const normalizedCode = String(code).trim().toUpperCase();
    if (await Hostel.exists({ code: normalizedCode })) {
      return res.status(409).json({ message: 'A hostel with that code already exists.' });
    }

    const hostel = await Hostel.create({
      name: String(name).trim(),
      code: normalizedCode,
      address: String(address || '').trim(),
      contactEmail: String(contactEmail || '').trim().toLowerCase(),
      contactPhone: String(contactPhone || '').trim()
    });

    res.status(201).json(hostel);
  } catch (error) { next(error); }
}
