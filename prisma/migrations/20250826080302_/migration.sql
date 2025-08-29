/*
  Warnings:

  - You are about to drop the column `year` on the `Registration` table. All the data in the column will be lost.
  - The primary key for the `Term` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_LectureTerms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,lectureId,termId]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[year,number]` on the table `Term` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Term` table without a default value. This is not possible if the table is not empty.
  - Made the column `startDate` on table `Term` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Term` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_termId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LectureTerms" DROP CONSTRAINT "_LectureTerms_B_fkey";

-- DropIndex
DROP INDEX "public"."Registration_userId_lectureId_year_termId_key";

-- DropIndex
DROP INDEX "public"."Term_number_key";

-- AlterTable
ALTER TABLE "public"."Registration" DROP COLUMN "year",
ALTER COLUMN "termId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Term" DROP CONSTRAINT "Term_pkey",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL,
ADD CONSTRAINT "Term_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."_LectureTerms" DROP CONSTRAINT "_LectureTerms_AB_pkey",
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_LectureTerms_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_lectureId_termId_key" ON "public"."Registration"("userId", "lectureId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "Term_year_number_key" ON "public"."Term"("year", "number");

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LectureTerms" ADD CONSTRAINT "_LectureTerms_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
