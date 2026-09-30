import multer from 'multer';
import { AppError } from '../utils/AppError';

// Vercel Serverless Functions have ephemeral filesystems and strict memory limits.
// We use MemoryStorage so files are kept as Buffers, which we can upload directly
// to Cloudinary or our StorageService without writing to disk.
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit
  },
});
