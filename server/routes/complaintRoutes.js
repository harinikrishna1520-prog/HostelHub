import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createComplaint, deleteComplaint, getComplaint, getComplaintImage, listComplaints, ownRoom, updateComplaintStatus } from '../controllers/complaintController.js';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const upload = multer({
  storage: multer.diskStorage({ destination: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads'), filename: (req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) return callback(new Error('Upload a JPG, PNG, WebP or GIF image.'));
    callback(null, true);
  }
});
const router = Router();
router.use(authMiddleware);
router.get('/room/me', ownRoom);
router.post('/', upload.single('image'), createComplaint);
router.get('/', listComplaints);
router.get('/:id/image', getComplaintImage);
router.get('/:id', getComplaint);
router.put('/:id/status', adminMiddleware, updateComplaintStatus);
router.delete('/:id', adminMiddleware, deleteComplaint);
export default router;