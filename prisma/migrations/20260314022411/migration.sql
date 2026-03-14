-- DropIndex
DROP INDEX "Lecture_name_idx";

-- DropIndex
DROP INDEX "Lecture_syllabusCode_idx";

-- AlterTable
ALTER TABLE "Lecture" ALTER COLUMN "academicYear" DROP DEFAULT;
