-- AlterTable
ALTER TABLE "Term"
ADD COLUMN "academicYear" INTEGER NOT NULL DEFAULT 2025;

-- DropIndex
DROP INDEX "Term_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "Term_academicYear_number_key"
ON "Term"("academicYear", "number");

-- CreateIndex
CREATE INDEX "Term_academicYear_startDate_endDate_idx"
ON "Term"("academicYear", "startDate", "endDate");

-- AlterTable
ALTER TABLE "Registration"
ADD COLUMN "academicYear" INTEGER NOT NULL DEFAULT 2025;

-- DropIndex
DROP INDEX "Registration_userId_lectureId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_lectureId_academicYear_key"
ON "Registration"("userId", "lectureId", "academicYear");

-- CreateIndex
CREATE INDEX "Registration_userId_academicYear_idx"
ON "Registration"("userId", "academicYear");
