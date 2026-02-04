# Data Model: CSV Quiz Upload

**Feature**: CSV Quiz Upload  
**Date**: February 4, 2026  
**Database**: SQLite (MVP) → PostgreSQL (production-ready)

## Overview

The data model supports storing quiz questions with multiple-choice answers, tracking CSV uploads, and enabling duplicate detection. All entities use auto-increment integer IDs for simplicity.

## Entity Relationship Diagram

```
┌─────────────────┐
│   CSVUpload     │
└─────────────────┘
        │
        │ (no direct FK - upload is tracking only)
        │
        ▼
┌─────────────────┐         ┌─────────────────┐
│   Question      │────────<│  AnswerOption   │
│                 │  1:4    │                 │
└─────────────────┘         └─────────────────┘
```

## Entities

### Question

Represents a quiz question in the global question pool.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `question_text` | TEXT | NOT NULL, UNIQUE | The question text (used for duplicate detection) |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When question was created |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

**Indexes**:
- Primary key index on `id`
- Unique index on `question_text` (for duplicate detection)
- Index on `created_at` (for chronological sorting)

**Validation Rules**:
- `question_text` must not be empty
- `question_text` must be trimmed (no leading/trailing whitespace)
- Maximum length: 2000 characters (reasonable question length)

**Relationships**:
- One-to-many with `AnswerOption` (exactly 4 answers per question)

---

### AnswerOption

Represents one of the four possible answers (a, b, c, d) for a question.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `question_id` | INTEGER | NOT NULL, FOREIGN KEY → Question(id) ON DELETE CASCADE | Reference to parent question |
| `option_label` | VARCHAR(1) | NOT NULL, CHECK(option_label IN ('a','b','c','d')) | Answer option label |
| `answer_text` | TEXT | NOT NULL | The answer text |
| `is_correct` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether this is the correct answer |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When answer was created |

**Indexes**:
- Primary key index on `id`
- Index on `question_id` (for joining with Question)
- Composite unique index on `(question_id, option_label)` (ensure each question has unique a,b,c,d)

**Validation Rules**:
- `option_label` must be exactly one of: 'a', 'b', 'c', 'd'
- `answer_text` must not be empty
- `answer_text` must be trimmed
- Maximum length: 500 characters (reasonable answer length)
- Each question must have exactly 4 answers (enforced at application level)
- Each question must have exactly 1 correct answer (enforced at application level)

**Relationships**:
- Many-to-one with `Question`

**Constraints**:
- `FOREIGN KEY (question_id) REFERENCES Question(id) ON DELETE CASCADE` - deleting a question deletes its answers
- `CHECK (option_label IN ('a', 'b', 'c', 'd'))` - only valid labels allowed
- `UNIQUE (question_id, option_label)` - no duplicate labels per question

---

### CSVUpload

Tracks CSV file upload operations for auditing and debugging.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `filename` | VARCHAR(255) | NOT NULL | Original filename |
| `file_size` | INTEGER | NOT NULL | File size in bytes |
| `total_rows` | INTEGER | NOT NULL, DEFAULT 0 | Total rows in CSV (excluding header) |
| `successful_imports` | INTEGER | NOT NULL, DEFAULT 0 | Number of questions successfully imported |
| `failed_imports` | INTEGER | NOT NULL, DEFAULT 0 | Number of questions that failed validation |
| `duplicate_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of duplicate questions rejected |
| `status` | VARCHAR(20) | NOT NULL, CHECK(status IN ('processing','completed','failed')) | Upload status |
| `error_summary` | TEXT | NULL | JSON array of error objects (row number, error message) |
| `uploaded_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When upload started |
| `completed_at` | DATETIME | NULL | When processing completed |

**Indexes**:
- Primary key index on `id`
- Index on `uploaded_at` (for chronological listing)
- Index on `status` (for filtering active uploads)

**Validation Rules**:
- `file_size` must be > 0 and <= 2097152 (2MB in bytes)
- `status` must be one of: 'processing', 'completed', 'failed'
- `successful_imports + failed_imports + duplicate_count` should equal `total_rows`
- `error_summary` must be valid JSON when not NULL

**Relationships**:
- None (tracking entity only; no direct FK to Question)

**Notes**:
- This entity provides upload audit trail
- `error_summary` stored as JSON text for flexibility (example format: `[{"row": 5, "error": "Missing answer_d column"}]`)
- Future enhancement: could add `user_id` field for multi-user support

---

## Database Schema (Prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

model Question {
  id            Int            @id @default(autoincrement())
  questionText  String         @unique @map("question_text") @db.Text
  answers       AnswerOption[]
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  @@index([createdAt])
  @@map("questions")
}

model AnswerOption {
  id          Int      @id @default(autoincrement())
  questionId  Int      @map("question_id")
  optionLabel String   @map("option_label") @db.VarChar(1)
  answerText  String   @map("answer_text") @db.Text
  isCorrect   Boolean  @default(false) @map("is_correct")
  createdAt   DateTime @default(now()) @map("created_at")
  
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([questionId, optionLabel])
  @@index([questionId])
  @@map("answer_options")
}

model CSVUpload {
  id                 Int       @id @default(autoincrement())
  filename           String    @db.VarChar(255)
  fileSize           Int       @map("file_size")
  totalRows          Int       @default(0) @map("total_rows")
  successfulImports  Int       @default(0) @map("successful_imports")
  failedImports      Int       @default(0) @map("failed_imports")
  duplicateCount     Int       @default(0) @map("duplicate_count")
  status             String    @db.VarChar(20)
  errorSummary       String?   @map("error_summary") @db.Text
  uploadedAt         DateTime  @default(now()) @map("uploaded_at")
  completedAt        DateTime? @map("completed_at")

  @@index([uploadedAt])
  @@index([status])
  @@map("csv_uploads")
}
```

## State Transitions

### CSVUpload Status Flow

```
[File Upload] → processing → completed
                          ↘ failed
```

**States**:
1. **processing**: CSV is being parsed and validated
2. **completed**: Processing finished (may have partial success + errors)
3. **failed**: Fatal error occurred (e.g., invalid CSV format, corrupted file)

**Transitions**:
- `processing → completed`: Normal completion (even with validation errors on some rows)
- `processing → failed`: Fatal error during parsing or file reading

## Data Integrity Rules

### Application-Level Constraints

These rules are enforced by the application logic (not database constraints):

1. **Question Creation**: When creating a question, exactly 4 answer options must be provided
2. **Correct Answer**: Exactly 1 answer option must have `is_correct = true`
3. **Label Completeness**: Answer options must include labels 'a', 'b', 'c', and 'd' (all four)
4. **Atomic Operations**: Question + 4 answers created in a transaction (all-or-nothing)
5. **Duplicate Detection**: Before insert, check if `question_text` already exists (case-sensitive exact match)

### Database-Level Constraints

Enforced by the database schema:

1. **Referential Integrity**: `AnswerOption.questionId` must reference valid `Question.id`
2. **Cascade Delete**: Deleting a question automatically deletes its answers
3. **Unique Question Text**: No two questions can have identical `question_text`
4. **Valid Labels**: `option_label` must be 'a', 'b', 'c', or 'd'
5. **Unique Labels**: Each question can have only one answer with each label
6. **Not Null**: Required fields cannot be NULL

## Migration Strategy

### SQLite → PostgreSQL

When migrating from SQLite (MVP) to PostgreSQL (production):

1. **Schema Changes**:
   - Change `@db.Text` to appropriate PostgreSQL text types
   - Update `datasource.provider` from "sqlite" to "postgresql"
   - Add `@db.VarChar` length constraints where appropriate

2. **Data Migration**:
   ```sql
   -- Export from SQLite
   sqlite3 dev.db .dump > dump.sql
   
   -- Import to PostgreSQL (after schema conversion)
   psql database_name < converted_dump.sql
   ```

3. **Index Optimization**:
   - Add full-text search index on `question_text` for advanced search (PostgreSQL only)
   - Consider `pg_trgm` extension for fuzzy duplicate detection (future enhancement)

4. **No Code Changes**: Prisma ORM abstracts database differences; application code remains unchanged

## Query Patterns

### Common Queries

1. **Check for Duplicate**:
   ```typescript
   const existing = await prisma.question.findUnique({
     where: { questionText: "What is the capital of France?" }
   });
   ```

2. **Get Question with Answers**:
   ```typescript
   const question = await prisma.question.findUnique({
     where: { id: 1 },
     include: { answers: { orderBy: { optionLabel: 'asc' } } }
   });
   ```

3. **List All Questions**:
   ```typescript
   const questions = await prisma.question.findMany({
     include: { answers: true },
     orderBy: { createdAt: 'desc' }
   });
   ```

4. **Create Question with Answers** (Transaction):
   ```typescript
   const question = await prisma.question.create({
     data: {
       questionText: "What is 2+2?",
       answers: {
         create: [
           { optionLabel: 'a', answerText: '3', isCorrect: false },
           { optionLabel: 'b', answerText: '4', isCorrect: true },
           { optionLabel: 'c', answerText: '5', isCorrect: false },
           { optionLabel: 'd', answerText: '6', isCorrect: false }
         ]
       }
     },
     include: { answers: true }
   });
   ```

5. **Track Upload Progress**:
   ```typescript
   await prisma.csvUpload.update({
     where: { id: uploadId },
     data: {
       status: 'completed',
       completedAt: new Date(),
       successfulImports: 45,
       failedImports: 3,
       duplicateCount: 2
     }
   });
   ```

## Performance Considerations

1. **Batch Inserts**: Use `createMany()` for bulk question creation (faster than individual creates)
2. **Unique Index**: The unique index on `question_text` makes duplicate detection O(log n)
3. **Cascade Deletes**: Database handles cascading deletes efficiently
4. **Connection Pooling**: Prisma manages connection pooling automatically
5. **Query Optimization**: Include only needed relations to minimize data transfer

## Data Validation Summary

| Field | Min Length | Max Length | Pattern/Format | Uniqueness |
|-------|-----------|------------|----------------|------------|
| `Question.questionText` | 1 | 2000 | Trimmed text | Unique |
| `AnswerOption.optionLabel` | 1 | 1 | 'a'\|'b'\|'c'\|'d' | Unique per question |
| `AnswerOption.answerText` | 1 | 500 | Trimmed text | - |
| `CSVUpload.filename` | 1 | 255 | Valid filename | - |
| `CSVUpload.fileSize` | 1 | 2097152 | Integer bytes | - |

## Future Enhancements

Potential schema extensions (not in MVP):

1. **Categories/Tags**: Add `Category` table + many-to-many relationship
2. **Question Difficulty**: Add `difficulty` enum field (easy/medium/hard)
3. **Question Media**: Add support for images/audio in questions
4. **User Management**: Add `User` table and `created_by` foreign keys
5. **Question History**: Track edits with versioning table
6. **Quiz Sessions**: Add tables for quiz attempts and scoring
