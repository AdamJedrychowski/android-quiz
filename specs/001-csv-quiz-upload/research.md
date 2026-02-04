# Research: CSV Quiz Upload

**Feature**: CSV Quiz Upload  
**Date**: February 4, 2026  
**Purpose**: Resolve technical unknowns and establish technology choices for implementation

## Research Questions

Based on Technical Context in [plan.md](plan.md), the following items need clarification:

1. **Language/Version**: Web stack selection
2. **Primary Dependencies**: Framework choices for frontend and backend
3. **Storage**: Database selection for question persistence
4. **Testing**: Testing framework choices

## Decisions & Rationale

### Decision 1: Technology Stack Selection

**Decision**: Use **Node.js 20 LTS with TypeScript** for both frontend and backend

**Rationale**:
- **Unified language**: Single language (TypeScript) across full stack reduces context switching and allows code sharing
- **CSV parsing**: Excellent CSV parsing libraries available (papaparse for frontend, csv-parse for backend)
- **Performance**: Node.js handles I/O-bound operations (file uploads, CSV parsing) efficiently
- **Ecosystem**: Rich ecosystem for web development with mature tooling
- **Modern**: TypeScript provides type safety, reducing runtime errors and improving developer experience

**Alternatives Considered**:
- **Python (FastAPI + Flask)**: Strong CSV libraries (pandas, csv module), but requires separate frontend stack (React/Vue), increasing complexity
- **Java (Spring Boot)**: Enterprise-grade but heavier weight for MVP; slower development iteration
- **PHP**: Good for web but less modern tooling; TypeScript offers better type safety

### Decision 2: Frontend Framework

**Decision**: Use **React 18 with Vite** for frontend development

**Rationale**:
- **Component-based**: Perfect for building modular UI (upload form, question list, error displays)
- **Rich ecosystem**: Abundant libraries for file upload (react-dropzone), form handling, and data display
- **Vite**: Fast build times and excellent development experience
- **Industry standard**: Large community, extensive documentation, easy to find developers
- **CSV preview**: Easy to integrate client-side CSV parsing for validation preview

**Alternatives Considered**:
- **Vue.js**: Simpler learning curve but smaller ecosystem
- **Svelte**: Excellent performance but less mature ecosystem
- **Vanilla JS**: Too much boilerplate for complex UI interactions
- **Next.js**: Adds server-side rendering complexity not needed for this feature

### Decision 3: Backend Framework

**Decision**: Use **Express.js with TypeScript** for backend API

**Rationale**:
- **Lightweight**: Minimal overhead, perfect for CSV processing API
- **Flexible**: Easy to add middleware for file upload, validation, error handling
- **Well-documented**: Extensive documentation and community support
- **File upload support**: Excellent libraries (multer) for handling multipart form data
- **Fast iteration**: Simple routing and middleware pattern allows rapid development

**Alternatives Considered**:
- **NestJS**: More structure but adds complexity for simple API; better for larger applications
- **Fastify**: Better performance but less ecosystem maturity
- **Koa**: Cleaner async handling but smaller community and fewer plugins

### Decision 4: Database Selection

**Decision**: Use **SQLite** for MVP, design for easy PostgreSQL migration

**Rationale**:
- **Zero configuration**: File-based database perfect for MVP and development
- **ACID compliance**: Ensures data integrity for question storage
- **Simple deployment**: No separate database server required
- **Good performance**: Sufficient for single-user MVP with thousands of questions
- **Migration path**: ORM abstraction (Prisma/TypeORM) allows easy PostgreSQL upgrade later
- **Full-text search**: Supports duplicate detection via text comparison

**Alternatives Considered**:
- **PostgreSQL**: Production-ready but adds deployment complexity for MVP
- **MongoDB**: Document store not ideal for structured quiz data with relationships
- **In-memory (Redis)**: Data persistence required; not suitable for primary storage
- **MySQL**: Similar to PostgreSQL but less feature-rich

### Decision 5: ORM/Database Access

**Decision**: Use **Prisma** as the database ORM

**Rationale**:
- **Type-safe**: Auto-generated TypeScript types from schema definition
- **Migration system**: Built-in database migrations for schema evolution
- **SQLite + PostgreSQL**: Supports both, enabling smooth upgrade path
- **Developer experience**: Excellent autocomplete and compile-time error checking
- **Query builder**: Intuitive API reduces SQL errors

**Alternatives Considered**:
- **TypeORM**: More features but heavier; less intuitive API
- **Sequelize**: Older, callback-based API less compatible with modern async/await
- **Knex.js**: Query builder only, no ORM features; more boilerplate

### Decision 6: Testing Frameworks

**Decision**: 
- **Backend**: **Vitest** for unit/integration tests
- **Frontend**: **Vitest + React Testing Library** for component tests
- **E2E**: **Playwright** for end-to-end workflows

**Rationale**:
- **Vitest**: Fast, Vite-native testing framework with excellent TypeScript support; Jest-compatible API
- **React Testing Library**: Best practice for testing React components; focuses on user behavior
- **Playwright**: Modern E2E framework; tests across multiple browsers; handles file uploads well
- **Unified tooling**: Vitest for both frontend and backend reduces learning curve

**Alternatives Considered**:
- **Jest**: Slower than Vitest; less Vite integration
- **Mocha/Chai**: Require more configuration; Vitest provides better defaults
- **Cypress**: Good E2E but Playwright has better multi-browser support and API testing

### Decision 7: CSV Parsing Libraries

**Decision**:
- **Backend**: **csv-parse** (from csv package)
- **Frontend**: **papaparse** (for client-side preview/validation)

**Rationale**:
- **csv-parse**: Stream-based parsing for large files; handles quoted fields, escape characters; Node.js native
- **papaparse**: Browser-friendly; excellent error reporting; handles edge cases (quotes, commas in fields)
- **Standards compliance**: Both follow RFC 4180 CSV specification
- **Error handling**: Both provide detailed error information with row/column numbers

**Alternatives Considered**:
- **fast-csv**: Good performance but less flexible error handling
- **CSV.js**: Smaller bundle but less feature-complete
- **Papa Parse on backend**: Possible but csv-parse is more Node.js optimized

## Technology Summary

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 20 LTS |
| Language | TypeScript | 5.3+ |
| Frontend Framework | React | 18.x |
| Frontend Build | Vite | 5.x |
| Backend Framework | Express | 4.x |
| Database | SQLite (→ PostgreSQL) | 3.x |
| ORM | Prisma | 5.x |
| Testing (Unit/Integration) | Vitest | 1.x |
| Testing (E2E) | Playwright | 1.x |
| CSV Parsing (Backend) | csv-parse | 5.x |
| CSV Parsing (Frontend) | papaparse | 5.x |
| File Upload | multer | 1.x |

## Best Practices Research

### CSV Parsing Best Practices

1. **Streaming**: Use streaming parsers for files approaching size limits (2MB) to avoid memory issues
2. **Validation**: Validate headers before processing rows; fail fast on missing columns
3. **Error accumulation**: Collect all validation errors rather than stopping at first error (supports partial import)
4. **Character encoding**: Detect and handle UTF-8, UTF-8 BOM; provide clear errors for unsupported encodings
5. **Quote handling**: Use RFC 4180 compliant parsers that handle quotes, escapes, and embedded commas
6. **Row tracking**: Maintain row numbers (1-indexed, excluding header) for error reporting

### File Upload Best Practices

1. **Size validation**: Check file size before upload (client) and during upload (server)
2. **MIME type checking**: Validate `text/csv` or `application/csv` content type
3. **Temporary storage**: Store uploaded files temporarily; clean up after processing
4. **Progress indication**: Show upload progress for user feedback
5. **Multipart form data**: Use standard multipart/form-data encoding for compatibility

### Duplicate Detection Best Practices

1. **Exact match**: Use case-sensitive exact string matching on question text for MVP
2. **Database index**: Create index on question text column for fast duplicate lookups
3. **Batch checking**: Query database once per CSV with all question texts to minimize round trips
4. **Early detection**: Check duplicates during parsing before database insertion
5. **Clear messaging**: Report which questions are duplicates with original question IDs/timestamps

### Database Schema Best Practices

1. **Normalization**: Separate questions and answers into related tables (1-to-many)
2. **Constraints**: Use database constraints (NOT NULL, CHECK) to enforce data integrity
3. **Timestamps**: Track created_at and updated_at for all entities
4. **UUIDs vs Auto-increment**: Use auto-increment IDs for simplicity in MVP
5. **Soft deletes**: Consider adding deleted_at column for future undo functionality

## Integration Patterns

### Upload Flow Architecture

```
Client Browser → Frontend (React)
                    ↓ (File + HTTP POST)
                Backend (Express + Multer)
                    ↓ (File validation)
                CSV Parser (csv-parse)
                    ↓ (Parsed rows)
                Question Service
                    ↓ (Duplicate check + Save)
                Database (SQLite via Prisma)
                    ↓ (Results)
                API Response
                    ↓ (JSON)
                Frontend (React)
                    ↓ (Display)
                User sees results
```

### Error Handling Strategy

1. **Client-side**: Validate file size, type before upload; provide immediate feedback
2. **Server-side**: Validate file integrity, CSV format, data completeness
3. **Parsing errors**: Accumulate row-level errors; continue processing valid rows
4. **Database errors**: Wrap in transactions; rollback on fatal errors
5. **User communication**: Structured error responses with error codes, messages, and affected rows

## Performance Considerations

### Expected Performance Metrics

- **CSV parsing**: ~100-200 rows/second (conservative estimate for validation + duplicate checking)
- **2MB file**: ~10,000 rows maximum → ~50-100 seconds processing time
- **Target**: Optimize to <10 seconds for 100-question file (typical use case)

### Optimization Strategies

1. **Batch inserts**: Insert valid questions in batches rather than one-by-one
2. **Prepared statements**: Use Prisma's compiled queries for consistent performance
3. **Index usage**: Ensure question text has database index for duplicate detection
4. **Streaming**: Process CSV in chunks to maintain low memory footprint
5. **Async processing**: Consider background job queue for very large files (future enhancement)

## Security Considerations

1. **File size limits**: Enforce 2MB limit to prevent DoS attacks
2. **File type validation**: Strictly validate CSV format; reject executables
3. **Content scanning**: Validate CSV doesn't contain malicious content (SQL injection patterns)
4. **Rate limiting**: Limit upload frequency per user/IP (future enhancement)
5. **Input sanitization**: Escape special characters in question/answer text before storage
6. **CORS**: Configure appropriate CORS headers for frontend-backend communication

## Open Questions for User Input

*None - all technical decisions resolved based on MVP requirements and industry best practices.*

## Conclusion

All technical unknowns have been resolved. The chosen stack (Node.js + TypeScript + React + Express + SQLite + Prisma) provides:

- ✅ Fast development iteration for MVP
- ✅ Type safety across full stack
- ✅ Excellent CSV parsing capabilities
- ✅ Clear upgrade path (SQLite → PostgreSQL)
- ✅ Modern tooling and developer experience
- ✅ Strong testing ecosystem

**Ready to proceed to Phase 1: Design**
