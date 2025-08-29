/*
  Warnings:

  - You are about to drop the column `termId` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the `_LectureTerms` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,lectureId,year,termNumber]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `termNumber` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_termId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LectureTerms" DROP CONSTRAINT "_LectureTerms_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LectureTerms" DROP CONSTRAINT "_LectureTerms_B_fkey";

-- DropIndex
DROP INDEX "public"."Registration_userId_lectureId_termId_key";

-- AlterTable
ALTER TABLE "public"."Lecture" ADD COLUMN     "termNumbers" INTEGER[];

-- AlterTable
ALTER TABLE "public"."Registration" DROP COLUMN "termId",
ADD COLUMN     "termNumber" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."_LectureTerms";

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_lectureId_year_termNumber_key" ON "public"."Registration"("userId", "lectureId", "year", "termNumber");
