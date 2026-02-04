# Implementation Plan: CSV Quiz Upload

**Branch**: `001-csv-quiz-upload` | **Date**: February 4, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-csv-quiz-upload/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web-based quiz learning application that accepts CSV file uploads containing quiz questions with multiple-choice answers (a, b, c, d) and correct answer designations. The system will validate CSV format, parse question data, check for duplicates, support partial imports, and store questions in a global pool for quiz delivery.

## Technical Context

**Language/Version**: Node.js 20 LTS with TypeScript 5.3+
**Primary Dependencies**: React 18 (Vite 5), Express 4, Prisma 5, csv-parse 5, papaparse 5, multer 1
**Storage**: SQLite 3 (MVP), designed for PostgreSQL migration
**Testing**: Vitest 1 (unit/integration), Playwright 1 (E2E), React Testing Library
**Target Platform**: Web browser (modern browsers: Chrome, Firefox, Safari, Edge) + Node.js server (Linux/Windows)
**Project Type**: web - requires frontend (upload UI, question review) + backend (file processing, storage, API)
**Performance Goals**: Process 2MB CSV files in <10 seconds; Handle 100 questions import; Display questions within 3 clicks
**Constraints**: 2MB file size limit; Duplicate detection on question text; UTF-8 encoding support; Partial import capability
**Scale/Scope**: MVP - single user scope initially; Global pool of questions (no categorization); Basic web interface with upload and review features

*See [research.md](research.md) for detailed technology selection rationale and best practices.*

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Status** (Pre-Phase 0): ⚠️ Constitution file is not yet ratified (contains template placeholders only)

**Action Taken**: Proceeded with standard best practices:
- Follow test-driven development where applicable
- Keep code modular and independently testable
- Document API contracts clearly
- Support both machine-readable (JSON) and human-readable formats for outputs

**Post-Phase 1 Status**: ✅ Design aligns with industry best practices

**Design Review**:
- ✅ **Modular architecture**: Clear separation between CSV parsing, validation, database operations, and API layers
- ✅ **Independently testable**: Each service (CSVParser, QuestionService, UploadService) can be unit tested in isolation
- ✅ **Contract-first design**: OpenAPI spec defines API contracts; CSV format contract specifies input format
- ✅ **Machine & human readable**: API responses in JSON; Error messages human-readable; CSV format accessible to non-technical users
- ✅ **Test-friendly**: Designed for TDD with clear unit test boundaries (see quickstart.md testing section)

**No constitutional violations identified**. Design follows standard web application patterns with appropriate separation of concerns.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── question.model.*        # Quiz question entity
│   │   ├── answer.model.*          # Answer option entity
│   │   └── upload.model.*          # CSV upload tracking entity
│   ├── services/
│   │   ├── csv-parser.service.*    # CSV parsing and validation
│   │   ├── question.service.*      # Question CRUD and duplicate checking
│   │   └── upload.service.*        # File upload handling
│   ├── api/
│   │   ├── upload.routes.*         # Upload endpoints
│   │   └── question.routes.*       # Question retrieval endpoints
│   └── lib/
│       └── validators.*            # CSV validation utilities
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
        └── sample.csv              # Test CSV files

frontend/
├── src/
│   ├── components/
│   │   ├── UploadForm.*            # CSV file upload UI
│   │   ├── QuestionList.*          # Question review display
│   │   └── ErrorDisplay.*          # Validation error messages
│   ├── pages/
│   │   ├── upload.*                # Upload page
│   │   └── questions.*             # Question review page
│   └── services/
│       └── api.service.*           # API client for backend
└── tests/
    ├── unit/
    └── e2e/
```

**Structure Decision**: Selected web application structure (Option 2) because the feature requires both a user-facing upload interface (frontend) and server-side file processing with storage (backend). The repository name "android-quiz" suggests eventual mobile support, but this MVP focuses on web to establish core functionality first.

## Complexity Tracking

**Status**: ✅ No constitutional violations identified

This feature follows standard web application patterns with appropriate separation of concerns. No complexity justification required.

---

## Planning Phase Summary

### Phase 0: Research ✅ Complete

**Output**: [research.md](research.md)

**Key Decisions Made**:
- Technology stack: Node.js 20 + TypeScript 5.3+
- Frontend: React 18 with Vite 5
- Backend: Express 4
- Database: SQLite 3 (MVP) → PostgreSQL (production path)
- ORM: Prisma 5
- CSV Parsing: csv-parse 5 (backend), papaparse 5 (frontend)
- Testing: Vitest 1 + Playwright 1
- File Upload: multer 1

**Rationale**: Unified TypeScript stack provides type safety across full application, excellent CSV parsing ecosystem, clear migration path to production database.

### Phase 1: Design ✅ Complete

**Outputs**:
- [data-model.md](data-model.md) - Complete database schema with Prisma definitions
- [contracts/api.yaml](contracts/api.yaml) - OpenAPI 3.0 REST API specification
- [contracts/csv-format.md](contracts/csv-format.md) - CSV file format specification
- [quickstart.md](quickstart.md) - Developer implementation guide
- [.github/agents/copilot-instructions.md](../../.github/agents/copilot-instructions.md) - Updated agent context

**Design Highlights**:
- **3 entities**: Question, AnswerOption, CSVUpload
- **5 API endpoints**: Upload CSV, list uploads, list questions, get question, get upload
- **Partial import support**: Validates and imports valid rows; reports errors for invalid rows
- **Duplicate detection**: Exact match on question text with database unique constraint
- **Error tracking**: Detailed error reporting with row numbers and descriptions

**Technical Validation**:
- ✅ Supports all 23 functional requirements from spec
- ✅ Meets all 7 success criteria
- ✅ Handles all identified edge cases
- ✅ Clear upgrade path (SQLite → PostgreSQL)
- ✅ Performance targets achievable (2MB in <10s)

### Constitutional Compliance

**Pre-Design**: Constitution template not ratified; applied industry best practices  
**Post-Design**: ✅ Design aligns with standard modular architecture principles

- Modular services (parser, question, upload)
- Contract-first API design (OpenAPI spec)
- Independently testable components
- Clear separation of concerns
- Machine-readable (JSON) and human-readable outputs

### Next Steps

**Ready for**: `/speckit.tasks` command to generate implementation tasks

**Implementation Order**:
1. Backend infrastructure (database, models, services)
2. API endpoints (upload, questions)
3. Frontend components (upload form, question list)
4. Testing (unit, integration, E2E)
5. Documentation and deployment

**Estimated Development Time**: 8-12 hours for full MVP implementation (based on quickstart guide phases)

---

**Planning Status**: ✅ **COMPLETE**  
**Date Completed**: February 4, 2026  
**Artifacts Generated**: 5 documents (research.md, data-model.md, 2 contracts, quickstart.md)  
**Ready for Implementation**: Yes
