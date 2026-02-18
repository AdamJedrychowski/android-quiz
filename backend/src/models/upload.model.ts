/**
 * CSVUpload model interface
 * Tracks CSV upload operations for auditing and debugging
 */

export interface CSVUpload {
  id: number;
  filename: string;
  fileSize: number;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  duplicateCount: number;
  status: 'processing' | 'completed' | 'failed';
  errorSummary: string | null; // JSON array of error objects
  uploadedAt: Date;
  completedAt: Date | null;
}

/**
 * Upload creation input (minimal fields)
 */
export interface CreateUploadInput {
  filename: string;
  fileSize: number;
  totalRows: number;
}

/**
 * Upload status update input
 */
export interface UpdateUploadInput {
  successfulImports?: number;
  failedImports?: number;
  duplicateCount?: number;
  status?: 'processing' | 'completed' | 'failed';
  errorSummary?: string | null;
  completedAt?: Date | null;
}

/**
 * Error detail for error summary JSON
 */
export interface UploadError {
  row: number;
  error: string;
}
