-- CreateTable
CREATE TABLE "questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "answer_options" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_id" INTEGER NOT NULL,
    "option_label" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "csv_uploads" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "successful_imports" INTEGER NOT NULL DEFAULT 0,
    "failed_imports" INTEGER NOT NULL DEFAULT 0,
    "duplicate_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "error_summary" TEXT,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_question_text_key" ON "questions"("question_text");

-- CreateIndex
CREATE INDEX "questions_created_at_idx" ON "questions"("created_at");

-- CreateIndex
CREATE INDEX "answer_options_question_id_idx" ON "answer_options"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "answer_options_question_id_option_label_key" ON "answer_options"("question_id", "option_label");

-- CreateIndex
CREATE INDEX "csv_uploads_uploaded_at_idx" ON "csv_uploads"("uploaded_at");

-- CreateIndex
CREATE INDEX "csv_uploads_status_idx" ON "csv_uploads"("status");
