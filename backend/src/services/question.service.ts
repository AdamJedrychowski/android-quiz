import { PrismaClient } from '@prisma/client';
import { CreateQuestionInput, QuestionWithAnswers } from '../models/question.model';

const prisma = new PrismaClient();

export interface QuestionImportResult {
  success: boolean;
  questionId?: number;
  isDuplicate: boolean;
  error?: string;
}

export interface BatchImportResult {
  totalProcessed: number;
  successfulImports: number;
  duplicates: number;
  failures: number;
  errors: Array<{ row: number; error: string }>;
}

/**
 * Check if a question with the same text already exists
 * @param questionText - Question text to check
 * @returns true if question exists
 */
export async function isDuplicateQuestion(questionText: string): Promise<boolean> {
  const trimmedText = questionText.trim();
  const existing = await prisma.question.findUnique({
    where: { questionText: trimmedText },
  });
  return existing !== null;
}

/**
 * Create a new question with its four answer options (transaction)
 * @param input - Question and answers data
 * @returns Created question with answers
 */
export async function createQuestion(input: CreateQuestionInput): Promise<QuestionWithAnswers> {
  const trimmedQuestionText = input.questionText.trim();

  // Create question with answers in a transaction
  const question = await prisma.question.create({
    data: {
      questionText: trimmedQuestionText,
      answers: {
        create: input.answers.map(answer => ({
          optionLabel: answer.optionLabel,
          answerText: answer.answerText.trim(),
          isCorrect: answer.isCorrect,
        })),
      },
    },
    include: {
      answers: true,
    },
  });

  return question as QuestionWithAnswers;
}

/**
 * Import multiple questions with duplicate detection
 * Processes each question independently - duplicates are skipped, failures recorded
 * @param questions - Array of questions to import
 * @returns Batch import result with counts and errors
 */
export async function batchImportQuestions(
  questions: CreateQuestionInput[]
): Promise<BatchImportResult> {
  const result: BatchImportResult = {
    totalProcessed: questions.length,
    successfulImports: 0,
    duplicates: 0,
    failures: 0,
    errors: [],
  };

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const rowNumber = i + 2; // +2 for header row and 1-based indexing

    try {
      // Check for duplicates
      const isDuplicate = await isDuplicateQuestion(question.questionText);
      if (isDuplicate) {
        result.duplicates++;
        result.errors.push({
          row: rowNumber,
          error: `Duplicate question: "${question.questionText.substring(0, 50)}..."`,
        });
        continue;
      }

      // Create question
      await createQuestion(question);
      result.successfulImports++;

    } catch (error: any) {
      result.failures++;
      result.errors.push({
        row: rowNumber,
        error: `Failed to import: ${error.message}`,
      });
    }
  }

  return result;
}

/**
 * Get all questions with pagination
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @returns Array of questions with answers
 */
export async function getAllQuestions(
  page: number = 1,
  limit: number = 20
): Promise<{ questions: QuestionWithAnswers[]; total: number; page: number; totalPages: number }> {
  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      skip,
      take: limit,
      include: {
        answers: {
          orderBy: { optionLabel: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.question.count(),
  ]);

  return {
    questions: questions as QuestionWithAnswers[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single question by ID with answers
 * @param id - Question ID
 * @returns Question with answers or null if not found
 */
export async function getQuestionById(id: number): Promise<QuestionWithAnswers | null> {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      answers: {
        orderBy: { optionLabel: 'asc' },
      },
    },
  });

  return question as QuestionWithAnswers | null;
}

/**
 * Delete all questions from the database
 * @returns Number of questions deleted
 */
export async function deleteAllQuestions(): Promise<number> {
  const count = await prisma.question.count();
  await prisma.question.deleteMany({});
  return count;
}
