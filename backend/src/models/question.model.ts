/**
 * Question model interface
 * Represents a quiz question with multiple-choice answers
 */

export interface Question {
  id: number;
  questionText: string;
  answers?: AnswerOption[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AnswerOption model interface (nested in Question)
 */
export interface AnswerOption {
  id: number;
  questionId: number;
  optionLabel: 'a' | 'b' | 'c' | 'd';
  answerText: string;
  isCorrect: boolean;
  createdAt: Date;
}

/**
 * Question creation input (without IDs and timestamps)
 */
export interface CreateQuestionInput {
  questionText: string;
  answers: CreateAnswerInput[];
}

/**
 * Answer creation input (without IDs and timestamps)
 */
export interface CreateAnswerInput {
  optionLabel: 'a' | 'b' | 'c' | 'd';
  answerText: string;
  isCorrect: boolean;
}

/**
 * Question with answers for API responses
 */
export interface QuestionWithAnswers extends Question {
  answers: AnswerOption[];
}
