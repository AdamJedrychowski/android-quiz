import { PrismaClient } from '@prisma/client';
import { parseCSV, ParsedCSVRow } from './csv-parser.service';
import { batchImportQuestions } from './question.service';
import { CreateQuestionInput } from '../models/question.model';
import { CSVUpload, CreateUploadInput, UploadError } from '../models/upload.model';

const prisma = new PrismaClient();

export interface UploadProcessResult {
  uploadId: number;
  filename: string;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  duplicateCount: number;
  errors: UploadError[];
  status: 'completed' | 'failed';
}

/**
 * Process CSV file upload - parse, validate, check duplicates, import
 * @param filename - Original filename
 * @param fileBuffer - File contents as buffer
 * @param fileSize - File size in bytes
 * @returns Upload processing result
 */
export async function processUpload(
  filename: string,
  fileBuffer: Buffer,
  fileSize: number
): Promise<UploadProcessResult> {
  
  // Step 1: Parse CSV file
  const parseResult = parseCSV(fileBuffer);

  if (!parseResult.success || parseResult.rows.length === 0) {
    // CSV parsing failed or no valid rows
    const uploadRecord = await createUploadRecord({
      filename,
      fileSize,
      totalRows: 0,
    });

    await updateUploadStatus(uploadRecord.id, {
      status: 'failed',
      failedImports: parseResult.errors.length,
      errorSummary: JSON.stringify(parseResult.errors),
      completedAt: new Date(),
    });

    return {
      uploadId: uploadRecord.id,
      filename,
      totalRows: 0,
      successfulImports: 0,
      failedImports: parseResult.errors.length,
      duplicateCount: 0,
      errors: parseResult.errors,
      status: 'failed',
    };
  }

  // Step 2: Create upload tracking record
  const uploadRecord = await createUploadRecord({
    filename,
    fileSize,
    totalRows: parseResult.rows.length,
  });

  try {
    // Step 3: Convert parsed rows to question input format
    const questions: CreateQuestionInput[] = parseResult.rows.map(row => ({
      questionText: row.question,
      answers: [
        { optionLabel: 'a', answerText: row.answer_a, isCorrect: row.correct === 'a' },
        { optionLabel: 'b', answerText: row.answer_b, isCorrect: row.correct === 'b' },
        { optionLabel: 'c', answerText: row.answer_c, isCorrect: row.correct === 'c' },
        { optionLabel: 'd', answerText: row.answer_d, isCorrect: row.correct === 'd' },
      ],
    }));

    // Step 4: Batch import questions (with duplicate detection)
    const importResult = await batchImportQuestions(questions);

    // Step 5: Combine parsing errors with import errors
    const allErrors = [...parseResult.errors, ...importResult.errors];

    // Step 6: Update upload record with final status
    await updateUploadStatus(uploadRecord.id, {
      successfulImports: importResult.successfulImports,
      failedImports: importResult.failures + parseResult.errors.length,
      duplicateCount: importResult.duplicates,
      status: 'completed',
      errorSummary: allErrors.length > 0 ? JSON.stringify(allErrors) : null,
      completedAt: new Date(),
    });

    return {
      uploadId: uploadRecord.id,
      filename,
      totalRows: parseResult.rows.length,
      successfulImports: importResult.successfulImports,
      failedImports: importResult.failures + parseResult.errors.length,
      duplicateCount: importResult.duplicates,
      errors: allErrors,
      status: 'completed',
    };

  } catch (error: any) {
    // Unexpected error during processing
    await updateUploadStatus(uploadRecord.id, {
      status: 'failed',
      errorSummary: JSON.stringify([{ row: 0, error: error.message }]),
      completedAt: new Date(),
    });

    throw error;
  }
}

/**
 * Create a new CSVUpload tracking record
 * @param input - Upload creation data
 * @returns Created upload record
 */
async function createUploadRecord(input: CreateUploadInput): Promise<CSVUpload> {
  const upload = await prisma.cSVUpload.create({
    data: {
      filename: input.filename,
      fileSize: input.fileSize,
      totalRows: input.totalRows,
      status: 'processing',
    },
  });

  return upload as CSVUpload;
}

/**
 * Update upload status and statistics
 * @param uploadId - Upload record ID
 * @param updates - Fields to update
 */
async function updateUploadStatus(
  uploadId: number,
  updates: {
    successfulImports?: number;
    failedImports?: number;
    duplicateCount?: number;
    status?: 'processing' | 'completed' | 'failed';
    errorSummary?: string | null;
    completedAt?: Date | null;
  }
): Promise<void> {
  await prisma.cSVUpload.update({
    where: { id: uploadId },
    data: updates,
  });
}

/**
 * Get all upload records with pagination
 * @param page - Page number
 * @param limit - Items per page
 * @returns Upload history
 */
export async function getUploadHistory(
  page: number = 1,
  limit: number = 20
): Promise<{ uploads: CSVUpload[]; total: number; page: number; totalPages: number }> {
  const skip = (page - 1) * limit;

  const [uploads, total] = await Promise.all([
    prisma.cSVUpload.findMany({
      skip,
      take: limit,
      orderBy: { uploadedAt: 'desc' },
    }),
    prisma.cSVUpload.count(),
  ]);

  return {
    uploads: uploads as CSVUpload[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
