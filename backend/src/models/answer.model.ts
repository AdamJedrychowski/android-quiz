/**
 * AnswerOption model interface
 * Represents one of four possible answers (a, b, c, d) for a question
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
 * Answer creation input (without ID and timestamp)
 */
export interface CreateAnswerInput {
  optionLabel: 'a' | 'b' | 'c' | 'd';
  answerText: string;
  isCorrect: boolean;
}
