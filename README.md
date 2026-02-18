# CSV Quiz Upload App

A web application for uploading quiz questions via CSV files and reviewing imported questions.

## Features

- 📤 **Upload CSV Files**: Import quiz questions with multiple-choice answers (a, b, c, d)
- ✅ **Validation**: Comprehensive CSV format validation with detailed error reporting
- 🔍 **Duplicate Detection**: Automatically detect and skip duplicate questions
- 📊 **View Questions**: Browse imported questions with pagination
- 🎯 **Answer Highlighting**: Correct answers clearly marked

## Tech Stack

- **Backend**: Node.js 20 LTS, TypeScript, Express, Prisma ORM
- **Database**: SQLite (development), PostgreSQL-ready (production)
- **Frontend**: React 18, TypeScript, Vite
- **File Processing**: csv-parse (backend), papaparse (frontend)
- **File Upload**: multer (2MB limit)

## Prerequisites

- Node.js 20 LTS or higher
- npm 9+ or yarn

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd android-quiz
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run database migrations (creates SQLite database)
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

## CSV File Format

CSV files must follow this exact format:

```csv
question,answer_a,answer_b,answer_c,answer_d,correct
What is the capital of France?,London,Paris,Berlin,Madrid,b
What is 2 + 2?,3,4,5,6,b
```

### Requirements:

- **Header row**: Must include `question,answer_a,answer_b,answer_c,answer_d,correct` (exact order)
- **Question**: 1-2000 characters, must be unique
- **Answers**: 1-500 characters each (a, b, c, d)
- **Correct**: One of `a`, `b`, `c`, or `d` (case-insensitive)
- **File size**: Maximum 2MB
- **Encoding**: UTF-8

See `backend/tests/fixtures/sample-questions.csv` for a valid example.

## Usage

### Upload Questions

1. Navigate to "Upload CSV" tab
2. Select a CSV file (max 2MB)
3. Click "Upload"
4. View import results:
   - ✅ Successfully imported questions
   - 🔁 Duplicates skipped
   - ❌ Validation errors (with row numbers)

### View Questions

1. Navigate to "View Questions" tab
2. Browse imported questions with pagination
3. Correct answers are highlighted in green with ✓ badge

## API Endpoints

### Upload CSV

```http
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "uploadId": 1,
  "filename": "questions.csv",
  "summary": {
    "totalRows": 10,
    "successfulImports": 8,
    "duplicates": 1,
    "failures": 1
  },
  "errors": [
    { "row": 5, "error": "Question text cannot be empty" }
  ],
  "status": "completed"
}
```

### Get Questions

```http
GET /api/questions?page=1&limit=20

Response:
{
  "questions": [...],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

### Get Single Question

```http
GET /api/questions/:id

Response:
{
  "id": 1,
  "questionText": "What is the capital of France?",
  "answers": [
    { "optionLabel": "a", "answerText": "London", "isCorrect": false },
    { "optionLabel": "b", "answerText": "Paris", "isCorrect": true },
    ...
  ]
}
```

## Development

### Backend Scripts

```bash
npm run dev          # Start development server with tsx
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run compiled JavaScript
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build production bundle
npm run preview      # Preview production build
```

### Database Management

```bash
# View database in GUI
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Project Structure

```
android-quiz/
├── backend/
│   ├── src/
│   │   ├── api/              # Express route handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # TypeScript interfaces
│   │   ├── lib/              # Utilities (multer, validators)
│   │   └── index.ts          # Express server
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── tests/fixtures/       # Sample CSV files
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── types.ts          # TypeScript types
│   │   ├── App.tsx           # Main app component
│   │   └── App.css           # Styles
│   └── vite.config.ts
└── specs/                    # Feature specifications
```

## Troubleshooting

### Backend won't start

```bash
# Check Node.js version (must be 20+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Database errors

```bash
# Reset database and migrations
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev --name init
```

### Frontend can't connect to backend

1. Verify backend is running on `http://localhost:3000`
2. Check `frontend/.env` has correct `VITE_API_BASE_URL`
3. Check browser console for CORS errors
4. Restart both frontend and backend servers

## Production Deployment

### Database Migration

1. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from sqlite
     url      = env("DATABASE_URL")
   }
   ```

2. Set production DATABASE_URL:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Environment Variables

**Backend (.env)**:
```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
```

**Frontend (.env.production)**:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## License

MIT

## Support

For issues, questions, or feature requests, see `specs/001-csv-quiz-upload/` for detailed specifications.
