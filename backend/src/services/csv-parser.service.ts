import { parse } from 'csv-parse/sync';

export interface ParsedCSVRow {
  question: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct: 'a' | 'b' | 'c' | 'd';
}

export interface CSVParseResult {
  success: boolean;
  rows: ParsedCSVRow[];
  errors: Array<{ row: number; error: string }>;
}

// Expected CSV headers (case-sensitive, exact order)
const REQUIRED_HEADERS = ['question', 'answer_a', 'answer_b', 'answer_c', 'answer_d', 'correct'];

/**
 * Parse and validate CSV file contents
 * @param fileBuffer - CSV file buffer
 * @returns Parse result with rows and errors
 */
export function parseCSV(fileBuffer: Buffer): CSVParseResult {
  const errors: Array<{ row: number; error: string }> = [];
  const rows: ParsedCSVRow[] = [];

  try {
    // Parse CSV with csv-parse
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: false,
    });

    // Validate header row
    if (records.length === 0) {
      errors.push({ row: 0, error: 'CSV file is empty or contains only headers' });
      return { success: false, rows: [], errors };
    }

    // Check if all required columns exist
    const firstRecord = records[0];
    const actualHeaders = Object.keys(firstRecord);
    
    const missingHeaders = REQUIRED_HEADERS.filter(h => !actualHeaders.includes(h));
    if (missingHeaders.length > 0) {
      errors.push({ 
        row: 0, 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      });
      return { success: false, rows: [], errors };
    }

    // Validate each row
    records.forEach((record: any, index: number) => {
      const rowNumber = index + 2; // +2 because: +1 for header, +1 for 1-based indexing
      const rowErrors = validateRow(record, rowNumber);
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        // Row is valid, add to results
        rows.push({
          question: record.question.trim(),
          answer_a: record.answer_a.trim(),
          answer_b: record.answer_b.trim(),
          answer_c: record.answer_c.trim(),
          answer_d: record.answer_d.trim(),
          correct: record.correct.toLowerCase() as 'a' | 'b' | 'c' | 'd',
        });
      }
    });

    return {
      success: errors.length === 0,
      rows,
      errors,
    };

  } catch (error: any) {
    // CSV parsing error (malformed CSV)
    errors.push({ 
      row: 0, 
      error: `CSV parsing error: ${error.message}` 
    });
    return { success: false, rows: [], errors };
  }
}

/**
 * Validate a single CSV row
 * @param record - Parsed CSV record
 * @param rowNumber - Row number for error reporting
 * @returns Array of validation errors
 */
function validateRow(record: any, rowNumber: number): Array<{ row: number; error: string }> {
  const errors: Array<{ row: number; error: string }> = [];

  // Validate question field
  if (!record.question || record.question.trim().length === 0) {
    errors.push({ row: rowNumber, error: 'Question text cannot be empty' });
  } else if (record.question.trim().length > 2000) {
    errors.push({ row: rowNumber, error: 'Question text exceeds 2000 characters' });
  }

  // Validate answer fields
  const answerFields = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
  answerFields.forEach(field => {
    if (!record[field] || record[field].trim().length === 0) {
      errors.push({ row: rowNumber, error: `${field} cannot be empty` });
    } else if (record[field].trim().length > 500) {
      errors.push({ row: rowNumber, error: `${field} exceeds 500 characters` });
    }
  });

  // Validate correct answer designation
  if (!record.correct || record.correct.trim().length === 0) {
    errors.push({ row: rowNumber, error: 'Correct answer designation cannot be empty' });
  } else {
    const correctValue = record.correct.toLowerCase().trim();
    if (!['a', 'b', 'c', 'd'].includes(correctValue)) {
      errors.push({ 
        row: rowNumber, 
        error: `Correct answer must be 'a', 'b', 'c', or 'd' (got '${record.correct}')` 
      });
    }
  }

  return errors;
}
