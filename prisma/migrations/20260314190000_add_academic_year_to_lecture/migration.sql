-- AlterTable
ALTER TABLE "Lecture"
ADD COLUMN "academicYear" INTEGER NOT NULL DEFAULT 2025;

-- DropIndex
DROP INDEX "Lecture_syllabusCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_syllabusCode_academicYear_key"
ON "Lecture"("syllabusCode", "academicYear");

-- CreateIndex
CREATE INDEX "Lecture_academicYear_syllabusCode_idx"
ON "Lecture"("academicYear", "syllabusCode");

-- CreateIndex
CREATE INDEX "Lecture_academicYear_name_idx"
ON "Lecture"("academicYear", "name");

-- AlterTable
ALTER TABLE "Lecture" ALTER COLUMN "academicYear" DROP DEFAULT;
