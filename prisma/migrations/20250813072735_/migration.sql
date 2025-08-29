/*
  Warnings:

  - You are about to drop the column `isPublicEditable` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `syllabusId` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the `Syllabus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SyllabusDepartments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SyllabusSchedules` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[syllabusCode]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ownerId` on table `Lecture` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Lecture" DROP CONSTRAINT "Lecture_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lecture" DROP CONSTRAINT "Lecture_syllabusId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SyllabusDepartments" DROP CONSTRAINT "_SyllabusDepartments_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SyllabusDepartments" DROP CONSTRAINT "_SyllabusDepartments_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SyllabusSchedules" DROP CONSTRAINT "_SyllabusSchedules_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SyllabusSchedules" DROP CONSTRAINT "_SyllabusSchedules_B_fkey";

-- AlterTable
ALTER TABLE "public"."Lecture" DROP COLUMN "isPublicEditable",
DROP COLUMN "syllabusId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "evalMethod" TEXT,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "isExam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUserModified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "syllabusCode" TEXT,
ADD COLUMN     "textbook" TEXT,
ADD COLUMN     "units" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "ownerId" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Syllabus";

-- DropTable
DROP TABLE "public"."_SyllabusDepartments";

-- DropTable
DROP TABLE "public"."_SyllabusSchedules";

-- CreateTable
CREATE TABLE "public"."_LectureDepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LectureDepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_LectureToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LectureToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LectureDepartments_B_index" ON "public"."_LectureDepartments"("B");

-- CreateIndex
CREATE INDEX "_LectureToUser_B_index" ON "public"."_LectureToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_syllabusCode_key" ON "public"."Lecture"("syllabusCode");

-- CreateIndex
CREATE INDEX "Lecture_syllabusCode_idx" ON "public"."Lecture"("syllabusCode");

-- CreateIndex
CREATE INDEX "Lecture_name_idx" ON "public"."Lecture"("name");

-- CreateIndex
CREATE INDEX "Lecture_ownerId_idx" ON "public"."Lecture"("ownerId");

-- AddForeignKey
ALTER TABLE "public"."_LectureDepartments" ADD CONSTRAINT "_LectureDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LectureDepartments" ADD CONSTRAINT "_LectureDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LectureToUser" ADD CONSTRAINT "_LectureToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LectureToUser" ADD CONSTRAINT "_LectureToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
