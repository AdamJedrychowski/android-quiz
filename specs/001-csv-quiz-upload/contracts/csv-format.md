# CSV File Format Contract

**Feature**: CSV Quiz Upload  
**Date**: February 4, 2026  
**Version**: 1.0.0

## Overview

This document defines the expected CSV file format for uploading quiz questions. The format must be strictly adhered to for successful import.

## File Requirements

| Requirement | Value | Validation |
|-------------|-------|------------|
| **File Extension** | `.csv` | Case-insensitive |
| **MIME Type** | `text/csv` or `application/csv` | Checked on upload |
| **Maximum Size** | 2 MB (2,097,152 bytes) | Hard limit enforced |
| **Encoding** | UTF-8 | UTF-8 BOM accepted; other encodings rejected |
| **Line Endings** | LF (`\n`) or CRLF (`\r\n`) | Both accepted |
| **Delimiter** | Comma (`,`) | Standard CSV delimiter |

## CSV Structure

### Header Row (Required)

The first row MUST contain exactly these column names in this order:

```csv
question,answer_a,answer_b,answer_c,answer_d,correct
```

**Header Validation Rules**:
- ✅ Case-sensitive: must be lowercase
- ✅ No extra spaces before/after column names
- ✅ All 6 columns required
- ✅ Order must match exactly
- ❌ Extra columns not allowed
- ❌ Missing columns cause rejection

### Data Rows

Each data row represents one quiz question with its four answer options and correct answer designation.

**Example Valid Row**:
```csv
What is the capital of France?,London,Paris,Berlin,Madrid,b
```

## Column Specifications

### 1. `question` Column

**Purpose**: The question text to display to quiz takers

| Property | Value |
|----------|-------|
| **Data Type** | Text/String |
| **Required** | Yes |
| **Min Length** | 1 character (after trimming) |
| **Max Length** | 2000 characters |
| **Empty Values** | ❌ Not allowed |
| **Whitespace** | Leading/trailing whitespace trimmed |
| **Special Characters** | Allowed (quotes, commas must be escaped) |
| **Uniqueness** | Must be unique across all questions in database |

**Validation Rules**:
- Cannot be empty or whitespace-only
- Must be unique (duplicate questions rejected)
- Trimmed before storage (no leading/trailing spaces)

**Examples**:
```csv
✅ "What is the capital of France?"
✅ "Which element has the symbol ""O""?"
✅ "What year did World War II end?"
❌ ""                                      (empty)
❌ "   "                                   (whitespace only)
```

### 2. `answer_a` Column

**Purpose**: Text for answer option A

| Property | Value |
|----------|-------|
| **Data Type** | Text/String |
| **Required** | Yes |
| **Min Length** | 1 character (after trimming) |
| **Max Length** | 500 characters |
| **Empty Values** | ❌ Not allowed |

**Validation Rules**: Same as question column (except no uniqueness requirement)

### 3. `answer_b` Column

**Purpose**: Text for answer option B

| Property | Value |
|----------|-------|
| **Data Type** | Text/String |
| **Required** | Yes |
| **Min Length** | 1 character (after trimming) |
| **Max Length** | 500 characters |
| **Empty Values** | ❌ Not allowed |

### 4. `answer_c` Column

**Purpose**: Text for answer option C

| Property | Value |
|----------|-------|
| **Data Type** | Text/String |
| **Required** | Yes |
| **Min Length** | 1 character (after trimming) |
| **Max Length** | 500 characters |
| **Empty Values** | ❌ Not allowed |

### 5. `answer_d` Column

**Purpose**: Text for answer option D

| Property | Value |
|----------|-------|
| **Data Type** | Text/String |
| **Required** | Yes |
| **Min Length** | 1 character (after trimming) |
| **Max Length** | 500 characters |
| **Empty Values** | ❌ Not allowed |

### 6. `correct` Column

**Purpose**: Designation of which answer option is correct

| Property | Value |
|----------|-------|
| **Data Type** | Single character |
| **Required** | Yes |
| **Valid Values** | `a`, `b`, `c`, or `d` (lowercase) |
| **Case Sensitivity** | Case-insensitive (uppercase accepted, converted to lowercase) |
| **Empty Values** | ❌ Not allowed |

**Validation Rules**:
- Must be exactly one character: 'a', 'b', 'c', or 'd'
- Case-insensitive: 'A' converted to 'a', 'B' to 'b', etc.
- Must match one of the four answer columns

**Examples**:
```csv
✅ a
✅ b
✅ C      (converted to lowercase 'c')
✅ D      (converted to lowercase 'd')
❌ e      (invalid - only a, b, c, d allowed)
❌ ab     (invalid - must be single character)
❌ ""     (invalid - cannot be empty)
❌ 1      (invalid - must be letter)
```

## CSV Encoding Rules

### Quoting

Fields containing special characters MUST be enclosed in double quotes (`"`).

**Fields requiring quotes**:
- Contains comma (`,`)
- Contains newline (`\n` or `\r\n`)
- Contains double quote (`"`)

**Quote Escaping**:
- Double quotes within a field must be escaped by doubling them (`""`)

**Examples**:
```csv
question,answer_a,answer_b,answer_c,answer_d,correct
"What is the formula for water?",H2O,CO2,O2,N2,a
"Which city is called ""The Big Apple""?",Los Angeles,New York,Chicago,Boston,b
"What is 10,000 + 5,000?","10,000","15,000","20,000","25,000",b
```

### Whitespace Handling

| Location | Behavior |
|----------|----------|
| Leading/trailing spaces in fields | Trimmed (removed) |
| Spaces within field text | Preserved |
| Empty lines | Ignored |
| Whitespace-only rows | Treated as invalid |

## Complete Example File

```csv
question,answer_a,answer_b,answer_c,answer_d,correct
What is the capital of France?,London,Paris,Berlin,Madrid,b
What is 2 + 2?,3,4,5,6,b
"Which element has the symbol ""O""?",Oxygen,Gold,Silver,Carbon,a
What is the largest planet in our solar system?,Earth,Mars,Jupiter,Saturn,c
In what year did World War II end?,1943,1944,1945,1946,c
```

## Validation Error Messages

When CSV format is invalid, the system provides specific error messages:

| Error Condition | Error Message |
|----------------|---------------|
| Missing header | `Invalid CSV format - missing required header columns` |
| Wrong column names | `Invalid CSV format - header must be: question,answer_a,answer_b,answer_c,answer_d,correct` |
| Extra columns | `Invalid CSV format - unexpected extra columns found` |
| Empty question | `Row X: Question text cannot be empty` |
| Empty answer | `Row X: Answer option Y cannot be empty` |
| Invalid correct value | `Row X: Invalid correct answer designation 'Z' - must be a, b, c, or d` |
| Duplicate question | `Row X: Duplicate question: 'QUESTION_TEXT'` |
| Missing columns in row | `Row X: Missing required column: COLUMN_NAME` |
| File too large | `File size exceeds maximum limit of 2MB` |
| Invalid encoding | `File encoding not supported - use UTF-8` |

## Partial Import Behavior

When a CSV contains both valid and invalid rows:

1. **Valid rows** are imported successfully
2. **Invalid rows** are skipped with errors reported
3. **Duplicate rows** are rejected with specific error messages
4. **Final report** shows:
   - Total rows processed
   - Successful imports count
   - Failed validations count
   - Duplicate rejections count
   - List of all errors with row numbers

**Example Response**:
```json
{
  "uploadId": 1,
  "filename": "quiz-questions.csv",
  "totalRows": 10,
  "successfulImports": 7,
  "failedImports": 2,
  "duplicateCount": 1,
  "errors": [
    {
      "row": 3,
      "error": "Invalid correct answer designation 'e' - must be a, b, c, or d"
    },
    {
      "row": 5,
      "error": "Answer option C cannot be empty"
    },
    {
      "row": 8,
      "error": "Duplicate question: 'What is the capital of France?'"
    }
  ],
  "message": "Imported 7 questions. 3 questions had errors (2 validation errors, 1 duplicate)"
}
```

## Edge Cases

### Empty File

**Content**: No rows (or only header row)

**Behavior**: Returns success with zero imports

**Response**:
```json
{
  "uploadId": 1,
  "filename": "empty.csv",
  "totalRows": 0,
  "successfulImports": 0,
  "failedImports": 0,
  "duplicateCount": 0,
  "errors": [],
  "message": "No questions found in CSV file"
}
```

### Header Only (No Data Rows)

Same as empty file - treated as zero questions to import.

### UTF-8 BOM

**Behavior**: Accepted and handled correctly

The UTF-8 Byte Order Mark (BOM) at the start of file is detected and stripped.

### Mixed Line Endings

**Behavior**: Accepted

Files with mixed `\n` and `\r\n` line endings are parsed correctly.

### Trailing Empty Lines

**Behavior**: Ignored

Empty lines at the end of the file are ignored.

## Testing CSV Files

### Minimal Valid CSV

```csv
question,answer_a,answer_b,answer_c,answer_d,correct
What is 1 + 1?,1,2,3,4,b
```

### CSV with Special Characters

```csv
question,answer_a,answer_b,answer_c,answer_d,correct
"What is the formula for water?",H2O,CO2,O2,N2,a
"Which city is called ""The Big Apple""?",Los Angeles,New York,Chicago,Boston,b
"What is 10,000 + 5,000?","10,000","15,000","20,000","25,000",b
```

### CSV with Validation Errors (for testing error handling)

```csv
question,answer_a,answer_b,answer_c,answer_d,correct
What is 2 + 2?,3,4,5,6,b
,London,Paris,Berlin,Madrid,b
What is the largest ocean?,Atlantic,Pacific,Indian,Arctic,e
What is H2O?,Water,,,Salt,a
```

**Expected Errors**:
- Row 2: Question text cannot be empty
- Row 3: Invalid correct answer 'e'
- Row 4: Answer options C and D cannot be empty

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | Initial CSV format specification |

## Related Documents

- [API Contract](api.yaml) - REST API specification
- [Data Model](../data-model.md) - Database schema
- [Feature Specification](../spec.md) - Full feature requirements
