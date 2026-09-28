import Notice from '../models/Notice.js';

export async function listNotices(req, res, next) {
  try { res.json(await Notice.find().populate('author', 'name').sort({ createdAt: -1 })); }
  catch (error) { next(error); }
}

export async function createNotice(req, res, next) {
  try {
    const notice = await Notice.create({ ...req.body, author: req.user._id });
    res.status(201).json(await notice.populate('author', 'name'));
  } catch (error) { next(error); }
}

export async function updateNotice(req, res, next) {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('author', 'name');
    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    res.json(notice);
  } catch (error) { next(error); }
}

export async function deleteNotice(req, res, next) {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    res.json({ message: 'Notice deleted.' });
  } catch (error) { next(error); }
}