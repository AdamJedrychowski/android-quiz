# Tasks: CSV Quiz Upload

**Feature**: CSV Quiz Upload (001-csv-quiz-upload)  
**Input**: Design documents from `/specs/001-csv-quiz-upload/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story (P1, P2, P3) to enable independent implementation and testing.

**Tests**: Not explicitly requested in specification - implementing core functionality first, tests can be added later.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3) for user story phase tasks only
- All paths are absolute from repository root

## Path Conventions (Web App Structure)

Per plan.md, this is a web application with:
- **Backend**: `backend/src/` for source, `backend/tests/` for tests
- **Frontend**: `frontend/src/` for source, `frontend/tests/` for tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure (backend/, frontend/) per plan.md structure
- [ ] T002 Initialize backend Node.js project with TypeScript, Express, Prisma, csv-parse, multer dependencies in backend/package.json
- [ ] T003 [P] Initialize frontend Vite+React+TypeScript project with axios, papaparse dependencies in frontend/package.json
- [ ] T004 [P] Configure backend TypeScript compiler settings in backend/tsconfig.json
- [ ] T005 [P] Configure frontend Vite build settings in frontend/vite.config.ts
- [ ] T006 Create .gitignore files for backend/node_modules, frontend/node_modules, backend/dist, frontend/dist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Initialize Prisma with SQLite provider in backend/prisma/schema.prisma
- [ ] T008 Define Question entity schema in backend/prisma/schema.prisma per data-model.md
- [ ] T009 Define AnswerOption entity schema in backend/prisma/schema.prisma per data-model.md
- [ ] T010 Define CSVUpload entity schema in backend/prisma/schema.prisma per data-model.md
- [ ] T011 Run Prisma migration to create database schema: npx prisma migrate dev --name init
- [ ] T012 Generate Prisma Client types: npx prisma generate
- [ ] T013 Create TypeScript model interfaces in backend/src/models/question.model.ts
- [ ] T014 [P] Create TypeScript model interfaces in backend/src/models/answer.model.ts
- [ ] T015 [P] Create TypeScript model interfaces in backend/src/models/upload.model.ts
- [ ] T016 Setup Express server with CORS middleware in backend/src/index.ts
- [ ] T017 [P] Configure multer file upload middleware with 2MB limit in backend/src/lib/upload.middleware.ts
- [ ] T018 [P] Create API service client with base URL configuration in frontend/src/services/api.service.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Upload CSV Quiz File (Priority: P1) 🎯 MVP

**Goal**: Enable users to upload CSV files with quiz questions and import them into the system with success/error reporting

**Independent Test**: Upload a properly formatted CSV file with at least one question and verify the question appears in the quiz system with all four answer options and the correct answer marked

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implement CSV parser service with header validation in backend/src/services/csv-parser.service.ts
- [ ] T020 [P] [US1] Implement CSV row validation logic (answer labels, correct designation) in backend/src/services/csv-parser.service.ts
- [ ] T021 [US1] Implement question duplicate checking in backend/src/services/question.service.ts
- [ ] T022 [US1] Implement create question with answers (transaction) in backend/src/services/question.service.ts
- [ ] T023 [US1] Implement batch question creation with duplicate detection in backend/src/services/question.service.ts
- [ ] T024 [US1] Implement upload processing orchestration in backend/src/services/upload.service.ts (parse→validate→check duplicates→import)
- [ ] T025 [US1] Create CSVUpload tracking record with status management in backend/src/services/upload.service.ts
- [ ] T026 [US1] Implement POST /api/upload endpoint with multer in backend/src/api/upload.routes.ts per contracts/api.yaml
- [ ] T027 [US1] Add file size validation (2MB limit) in backend/src/api/upload.routes.ts
- [ ] T028 [US1] Add file type validation (CSV only) in backend/src/api/upload.routes.ts
- [ ] T029 [US1] Implement upload response formatting with success/error counts in backend/src/api/upload.routes.ts
- [ ] T030 [US1] Create upload form component with file input in frontend/src/components/UploadForm.tsx
- [ ] T031 [US1] Implement file selection and upload trigger in frontend/src/components/UploadForm.tsx
- [ ] T032 [US1] Display upload results (success count, errors with row numbers) in frontend/src/components/UploadForm.tsx
- [ ] T033 [US1] Create upload page with UploadForm component in frontend/src/pages/Upload.tsx
- [ ] T034 [US1] Add upload API call to frontend api service in frontend/src/services/api.service.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - users can upload CSV files and see import results

---

## Phase 4: User Story 2 - CSV Format Validation (Priority: P2)

**Goal**: Provide clear, actionable error messages when CSV files don't match expected format

**Independent Test**: Upload various malformed CSV files (missing columns, invalid data) and verify appropriate error messages are displayed for each type of formatting issue

### Implementation for User Story 2

- [ ] T035 [P] [US2] Implement CSV header validation with missing column detection in backend/src/lib/validators.ts
- [ ] T036 [P] [US2] Implement row-level field validation (empty fields, length limits) in backend/src/lib/validators.ts
- [ ] T037 [P] [US2] Implement correct answer designation validation (a/b/c/d only) in backend/src/lib/validators.ts
- [ ] T038 [US2] Integrate validators into CSV parser service with error accumulation in backend/src/services/csv-parser.service.ts
- [ ] T039 [US2] Format validation errors with row numbers and messages per contracts/api.yaml in backend/src/services/csv-parser.service.ts
- [ ] T040 [US2] Enhance upload route error handling for validation failures in backend/src/api/upload.routes.ts
- [ ] T041 [US2] Create error display component for validation messages in frontend/src/components/ErrorDisplay.tsx
- [ ] T042 [US2] Integrate ErrorDisplay into UploadForm for validation errors in frontend/src/components/UploadForm.tsx
- [ ] T043 [US2] Add client-side file size check before upload in frontend/src/components/UploadForm.tsx
- [ ] T044 [US2] Add client-side file type check (.csv extension) in frontend/src/components/UploadForm.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users get clear error messages for invalid CSV files

---

## Phase 5: User Story 3 - View Imported Questions (Priority: P3)

**Goal**: Allow users to review imported questions to verify correctness

**Independent Test**: Import a CSV file and navigate to questions list to verify all questions display with answer options and correct answer indicators

### Implementation for User Story 3

- [ ] T045 [P] [US3] Implement GET /api/questions endpoint with pagination in backend/src/api/question.routes.ts per contracts/api.yaml
- [ ] T046 [P] [US3] Implement GET /api/questions/:id endpoint in backend/src/api/question.routes.ts per contracts/api.yaml
- [ ] T047 [US3] Implement get all questions with pagination in backend/src/services/question.service.ts
- [ ] T048 [US3] Implement get single question by ID with answers in backend/src/services/question.service.ts
- [ ] T049 [US3] Create QuestionList component with question display in frontend/src/components/QuestionList.tsx
- [ ] T050 [US3] Display answer options with correct answer highlighting in frontend/src/components/QuestionList.tsx
- [ ] T051 [US3] Add pagination controls to QuestionList in frontend/src/components/QuestionList.tsx
- [ ] T052 [US3] Create questions page with QuestionList component in frontend/src/pages/Questions.tsx
- [ ] T053 [US3] Add get questions API call to frontend api service in frontend/src/services/api.service.ts
- [ ] T054 [US3] Create basic navigation between Upload and Questions pages in frontend/src/App.tsx

**Checkpoint**: All user stories should now be independently functional - complete upload and review workflow

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T055 [P] Add GET /api/uploads endpoint for upload history in backend/src/api/upload.routes.ts per contracts/api.yaml
- [ ] T056 [P] Create sample CSV files for testing in backend/tests/fixtures/
- [ ] T057 [P] Add environment variable configuration in backend/.env.example
- [ ] T058 [P] Add environment variable configuration in frontend/.env.example
- [ ] T059 Add error handling for database connection failures in backend/src/index.ts
- [ ] T060 [P] Add loading states to frontend components in frontend/src/components/
- [ ] T061 [P] Add basic styling/CSS to frontend components in frontend/src/
- [ ] T062 Create README.md with setup and run instructions per quickstart.md
- [ ] T063 Verify all endpoints match contracts/api.yaml specification
- [ ] T064 Verify CSV parsing matches contracts/csv-format.md specification
- [ ] T065 Run through quickstart.md validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion
  - User stories can proceed in parallel (if staffed) or sequentially by priority
  - Recommended order: US1 (MVP) → US2 (validation) → US3 (review)
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational - Depends on US1 for data but independently testable

### Within Each User Story

**User Story 1 (Upload CSV)**:
1. Backend services (T019-T025) - CSV parser and question service
2. Backend API routes (T026-T029) - Upload endpoint
3. Frontend components (T030-T032) - Upload form
4. Integration (T033-T034) - Page and API wiring

**User Story 2 (Validation)**:
1. Validators (T035-T037) - Can run in parallel
2. Integration (T038-T040) - Wire validators into services
3. Frontend error display (T041-T044) - Error UI

**User Story 3 (View Questions)**:
1. Backend API (T045-T048) - Questions endpoints and service
2. Frontend components (T049-T053) - Question display
3. Navigation (T054) - App routing

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel (independent project setup)

**Phase 2 (Foundational)**:
- T008-T010 can run in parallel (define entities)
- T013-T015 can run in parallel (model interfaces)
- T017-T018 can run in parallel (middleware and API client)

**Phase 3 (User Story 1)**:
- T019-T020 can run in parallel (CSV parsing tasks)

**Phase 4 (User Story 2)**:
- T035-T037 can run in parallel (validator implementations)

**Phase 5 (User Story 3)**:
- T045-T046 can run in parallel (API endpoints)

**Phase 6 (Polish)**:
- T055-T058, T060-T061 can all run in parallel (independent polish tasks)

---

## Parallel Execution Example: User Story 1

If you have multiple developers, User Story 1 tasks can be split:

**Developer A - Backend Services**:
```bash
# Parallel track 1
T019 → T020 → T021 → T022 → T023 → T024 → T025
```

**Developer B - Backend API**:
```bash
# Parallel track 2 (waits for T024-T025)
T026 → T027 → T028 → T029
```

**Developer C - Frontend**:
```bash
# Parallel track 3 (can start immediately after T018)
T030 → T031 → T032 → T033 → T034
```

All three tracks can work in parallel after foundational tasks complete.

---

## MVP Scope Recommendation

For fastest time-to-value, implement in this order:

1. **Phase 1-2**: Setup + Foundational (required baseline)
2. **Phase 3 (US1)**: Upload CSV capability - delivers immediate value
3. **Phase 4 (US2)**: Validation feedback - critical for usability
4. **Phase 5 (US3)**: Question review - quality assurance

**Minimum shippable**: Phase 1-2 + Phase 3 (User Story 1 only) = Basic CSV upload with import results

---

## Task Summary

- **Total Tasks**: 65
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 12 tasks
- **Phase 3 (User Story 1 - P1)**: 16 tasks
- **Phase 4 (User Story 2 - P2)**: 10 tasks
- **Phase 5 (User Story 3 - P3)**: 10 tasks
- **Phase 6 (Polish)**: 11 tasks

**Parallelizable Tasks**: 18 tasks marked with [P]

**Implementation Strategy**: 
- MVP first: Complete US1 for basic upload capability
- Incremental delivery: Add US2 for better UX, then US3 for verification
- Each user story is independently testable and deliverable
