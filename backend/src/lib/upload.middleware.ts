import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
// - Store files in memory as buffer (for processing)
// - 2MB file size limit
// - Accept only CSV files

const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only CSV files
  const allowedExtensions = ['.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB in bytes
  },
});
