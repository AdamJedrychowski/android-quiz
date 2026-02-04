# Quickstart Guide: CSV Quiz Upload

**Feature**: CSV Quiz Upload  
**Date**: February 4, 2026  
**For**: Developers implementing this feature

## Overview

This guide walks you through implementing the CSV Quiz Upload feature from scratch. Follow these phases in order for a smooth development experience.

## Prerequisites

Before starting:

- Node.js 20 LTS installed
- Git configured
- Code editor with TypeScript support (VS Code recommended)
- Basic understanding of React, Express, and Prisma

## Project Setup (10-15 minutes)

### 1. Initialize Project Structure

```bash
# From repository root
mkdir -p backend/src/{models,services,api,lib} backend/tests/{unit,integration,fixtures}
mkdir -p frontend/src/{components,pages,services} frontend/tests/{unit,e2e}

# Initialize backend
cd backend
npm init -y
npm install express prisma @prisma/client multer csv-parse cors dotenv
npm install -D typescript @types/node @types/express @types/multer @types/cors vitest tsx nodemon

# Initialize frontend
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install axios react-dropzone
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

cd ..
```

### 2. Configure TypeScript

**backend/tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3. Initialize Database

```bash
cd backend
npx prisma init --datasource-provider sqlite
```

Copy the Prisma schema from [data-model.md](data-model.md) into `backend/prisma/schema.prisma`.

```bash
# Generate Prisma client and create database
npx prisma generate
npx prisma migrate dev --name init
```

## Phase 1: Backend API (2-3 hours)

### Step 1: Create Data Models

**backend/src/models/question.model.ts**:
```typescript
export interface QuestionDTO {
  id: number;
  questionText: string;
  answers: AnswerOptionDTO[];
  createdAt: Date;
}

export interface AnswerOptionDTO {
  id: number;
  optionLabel: 'a' | 'b' | 'c' | 'd';
  answerText: string;
  isCorrect: boolean;
}

export interface CreateQuestionInput {
  questionText: string;
  answers: CreateAnswerInput[];
}

export interface CreateAnswerInput {
  optionLabel: 'a' | 'b' | 'c' | 'd';
  answerText: string;
  isCorrect: boolean;
}
```

### Step 2: Implement CSV Parser Service

**backend/src/services/csv-parser.service.ts**:
```typescript
import { parse } from 'csv-parse/sync';
import { CreateQuestionInput } from '../models/question.model';

export interface CSVRow {
  question: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct: string;
}

export interface ParsedQuestion {
  data: CreateQuestionInput;
  rowNumber: number;
}

export interface ParseError {
  row: number;
  error: string;
}

export class CSVParserService {
  async parseCSV(fileBuffer: Buffer): Promise<{
    questions: ParsedQuestion[];
    errors: ParseError[];
  }> {
    // Implementation: Parse CSV, validate rows, return questions and errors
    // See research.md for csv-parse library usage patterns
  }
}
```

**Key Implementation Points**:
- Use `csv-parse` with `columns: true` to parse header
- Validate header columns match required format
- Iterate rows, validate each field
- Collect errors instead of throwing on first error
- Return both valid questions and error list

### Step 3: Implement Question Service

**backend/src/services/question.service.ts**:
```typescript
import { PrismaClient } from '@prisma/client';
import { CreateQuestionInput, QuestionDTO } from '../models/question.model';

export class QuestionService {
  constructor(private prisma: PrismaClient) {}

  async checkDuplicate(questionText: string): Promise<boolean> {
    const existing = await this.prisma.question.findUnique({
      where: { questionText }
    });
    return !!existing;
  }

  async createQuestion(input: CreateQuestionInput): Promise<QuestionDTO> {
    // Create question with answers in transaction
  }

  async batchCreateQuestions(inputs: CreateQuestionInput[]): Promise<QuestionDTO[]> {
    // Create multiple questions efficiently
  }

  async getAllQuestions(limit = 100, offset = 0): Promise<{
    questions: QuestionDTO[];
    total: number;
  }> {
    // Fetch questions with pagination
  }
}
```

### Step 4: Implement Upload Service

**backend/src/services/upload.service.ts**:
```typescript
import { CSVParserService } from './csv-parser.service';
import { QuestionService } from './question.service';

export interface UploadResult {
  uploadId: number;
  filename: string;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  duplicateCount: number;
  errors: Array<{ row: number; error: string }>;
}

export class UploadService {
  constructor(
    private csvParser: CSVParserService,
    private questionService: QuestionService,
    private prisma: PrismaClient
  ) {}

  async processUpload(
    filename: string,
    fileBuffer: Buffer,
    fileSize: number
  ): Promise<UploadResult> {
    // 1. Create upload record (status: processing)
    // 2. Parse CSV
    // 3. Check for duplicates
    // 4. Import valid questions
    // 5. Update upload record (status: completed)
    // 6. Return results
  }
}
```

### Step 5: Create API Routes

**backend/src/api/upload.routes.ts**:
```typescript
import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  // Handle upload - see api.yaml for response format
});

router.get('/uploads', async (req, res) => {
  // List upload history
});

export default router;
```

**backend/src/api/question.routes.ts**:
```typescript
import express from 'express';

const router = express.Router();

router.get('/questions', async (req, res) => {
  // List questions with pagination
});

router.get('/questions/:id', async (req, res) => {
  // Get single question
});

export default router;
```

### Step 6: Setup Express Server

**backend/src/index.ts**:
```typescript
import express from 'express';
import cors from 'cors';
import uploadRoutes from './api/upload.routes';
import questionRoutes from './api/question.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', uploadRoutes);
app.use('/api', questionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**backend/package.json scripts**:
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  }
}
```

## Phase 2: Frontend UI (2-3 hours)

### Step 1: Create API Service

**frontend/src/services/api.service.ts**:
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface UploadResponse {
  uploadId: number;
  filename: string;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  duplicateCount: number;
  errors: Array<{ row: number; error: string }>;
  message: string;
}

export const apiService = {
  uploadCSV: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  },

  getQuestions: async (limit = 100, offset = 0) => {
    const response = await axios.get(`${API_BASE_URL}/questions`, {
      params: { limit, offset }
    });
    return response.data;
  }
};
```

### Step 2: Create Upload Form Component

**frontend/src/components/UploadForm.tsx**:
```typescript
import { useState } from 'react';
import { apiService, UploadResponse } from '../services/api.service';

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await apiService.uploadCSV(file);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Quiz Questions</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload CSV'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      {result && (
        <div>
          <h3>Upload Results</h3>
          <p>{result.message}</p>
          <ul>
            <li>Total rows: {result.totalRows}</li>
            <li>Successful: {result.successfulImports}</li>
            <li>Failed: {result.failedImports}</li>
            <li>Duplicates: {result.duplicateCount}</li>
          </ul>
          
          {result.errors.length > 0 && (
            <div>
              <h4>Errors:</h4>
              <ul>
                {result.errors.map((err, idx) => (
                  <key={idx}>Row {err.row}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create Question List Component

**frontend/src/components/QuestionList.tsx**:
```typescript
import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

interface Question {
  id: number;
  questionText: string;
  answers: Array<{
    id: number;
    optionLabel: string;
    answerText: string;
    isCorrect: boolean;
  }>;
  createdAt: string;
}

export function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await apiService.getQuestions();
      setQuestions(data.questions);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Question Bank ({questions.length} questions)</h2>
      {questions.map((q) => (
        <div key={q.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{q.questionText}</h3>
          <ul>
            {q.answers.map((a) => (
              <li key={a.id} style={{ fontWeight: a.isCorrect ? 'bold' : 'normal' }}>
                {a.optionLabel}) {a.answerText}
                {a.isCorrect && ' ✓'}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Step 4: Create Pages

**frontend/src/pages/Upload.tsx**:
```typescript
import { UploadForm } from '../components/UploadForm';

export function UploadPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>CSV Quiz Upload</h1>
      <UploadForm />
    </div>
  );
}
```

**frontend/src/pages/Questions.tsx**:
```typescript
import { QuestionList } from '../components/QuestionList';

export function QuestionsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Quiz Questions</h1>
      <QuestionList />
    </div>
  );
}
```

### Step 5: Setup Routing

**frontend/src/App.tsx**:
```typescript
import { useState } from 'react';
import { UploadPage } from './pages/Upload';
import { QuestionsPage } from './pages/Questions';

function App() {
  const [page, setPage] = useState<'upload' | 'questions'>('upload');

  return (
    <div>
      <nav style={{ padding: '10px', background: '#eee' }}>
        <button onClick={() => setPage('upload')}>Upload CSV</button>
        <button onClick={() => setPage('questions')}>View Questions</button>
      </nav>
      
      {page === 'upload' && <UploadPage />}
      {page === 'questions' && <QuestionsPage />}
    </div>
  );
}

export default App;
```

## Phase 3: Testing (2-3 hours)

### Backend Unit Tests

**backend/tests/unit/csv-parser.test.ts**:
```typescript
import { describe, it, expect } from 'vitest';
import { CSVParserService } from '../../src/services/csv-parser.service';

describe('CSVParserService', () => {
  it('should parse valid CSV', async () => {
    const csv = `question,answer_a,answer_b,answer_c,answer_d,correct
What is 2+2?,3,4,5,6,b`;
    
    const parser = new CSVParserService();
    const result = await parser.parseCSV(Buffer.from(csv));
    
    expect(result.questions).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect invalid correct answer', async () => {
    const csv = `question,answer_a,answer_b,answer_c,answer_d,correct
What is 2+2?,3,4,5,6,e`;
    
    const parser = new CSVParserService();
    const result = await parser.parseCSV(Buffer.from(csv));
    
    expect(result.questions).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toContain('Invalid correct answer');
  });
});
```

### Integration Tests

**backend/tests/integration/upload.test.ts**:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('POST /api/upload', () => {
  it('should upload valid CSV', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', 'tests/fixtures/valid.csv')
      .expect(200);

    expect(response.body.successfulImports).toBeGreaterThan(0);
  });

  it('should reject file over 2MB', async () => {
    // Create or use large CSV file
    const response = await request(app)
      .post('/api/upload')
      .attach('file', 'tests/fixtures/large.csv')
      .expect(400);

    expect(response.body.code).toBe('FILE_TOO_LARGE');
  });
});
```

### E2E Tests

**frontend/tests/e2e/upload.spec.ts**:
```typescript
import { test, expect } from '@playwright/test';

test('upload CSV file successfully', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/sample.csv');
  
  await page.click('button:has-text("Upload CSV")');
  
  // Wait for result
  await expect(page.locator('text=Upload Results')).toBeVisible();
  await expect(page.locator('text=Successful:')).toBeVisible();
});
```

## Running the Application

### Development Mode

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Testing the Feature

### Create Test CSV File

**test-questions.csv**:
```csv
question,answer_a,answer_b,answer_c,answer_d,correct
What is the capital of France?,London,Paris,Berlin,Madrid,b
What is 2 + 2?,3,4,5,6,b
Which element has the symbol O?,Oxygen,Gold,Silver,Carbon,a
What is the largest planet?,Earth,Mars,Jupiter,Saturn,c
```

### Test Flow

1. **Upload CSV**:
   - Go to Upload page
   - Select test-questions.csv
   - Click "Upload CSV"
   - Verify success message shows 4 imports

2. **View Questions**:
   - Navigate to Questions page
   - Verify all 4 questions appear
   - Verify correct answers are marked

3. **Test Duplicate Detection**:
   - Upload the same CSV again
   - Verify all 4 questions are rejected as duplicates

4. **Test Error Handling**:
   - Create invalid CSV (wrong correct answer)
   - Upload and verify error messages display

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Prisma Client not found" | Run `npx prisma generate` |
| CORS errors | Ensure `cors()` middleware in Express |
| File upload fails | Check multer configuration and limits |
| Database errors | Run `npx prisma migrate reset` |
| Port already in use | Change PORT in .env file |

## Next Steps

After completing this quickstart:

1. Add authentication (future enhancement)
2. Implement quiz-taking functionality
3. Add question editing/deletion
4. Migrate to PostgreSQL for production
5. Deploy to cloud platform

## Reference Documents

- [Feature Specification](spec.md) - Full requirements
- [Data Model](data-model.md) - Database schema details
- [API Contract](contracts/api.yaml) - Complete API specification
- [CSV Format](contracts/csv-format.md) - CSV validation rules
- [Research](research.md) - Technology decisions and best practices
