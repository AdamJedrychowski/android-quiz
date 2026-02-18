import express, { Request, Response } from 'express';
import { upload } from '../lib/upload.middleware';
import { processUpload, getUploadHistory } from '../services/upload.service';

const router = express.Router();

/**
 * POST /api/upload
 * Upload CSV file with quiz questions
 */
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a CSV file in the "file" field',
      });
    }

    const file = req.file;

    // Validate file type (already checked by multer, but double-check)
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only CSV files are allowed',
      });
    }

    // Validate file size (already checked by multer, but explicit check)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return res.status(400).json({
        error: 'File too large',
        message: `File size exceeds 2MB limit (${Math.round(file.size / 1024)}KB)`,
      });
    }

    // Process the upload
    const result = await processUpload(
      file.originalname,
      file.buffer,
      file.size
    );

    // Return upload results
    return res.status(200).json({
      uploadId: result.uploadId,
      filename: result.filename,
      summary: {
        totalRows: result.totalRows,
        successfulImports: result.successfulImports,
        duplicates: result.duplicateCount,
        failures: result.failedImports,
      },
      errors: result.errors,
      status: result.status,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload processing failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/upload
 * Get upload history with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getUploadHistory(page, limit);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Get upload history error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve upload history',
      message: error.message,
    });
  }
});

export default router;
