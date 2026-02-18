export interface UploadError {
  row: number;
  error: string;
}

export interface UploadResponse {
  uploadId: number;
  filename: string;
  summary: {
    totalRows: number;
    successfulImports: number;
    duplicates: number;
    failures: number;
  };
  errors: UploadError[];
  status: 'completed' | 'failed';
}

export interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  optionLabel: 'a' | 'b' | 'c' | 'd';
  answerText: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
}
