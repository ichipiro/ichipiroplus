/*
  Warnings:

  - You are about to drop the column `termNumber` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Registration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,lectureId,termId]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `termId` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Registration_userId_lectureId_year_termNumber_key";

-- AlterTable
ALTER TABLE "public"."Registration" DROP COLUMN "termNumber",
DROP COLUMN "year",
ADD COLUMN     "termId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_lectureId_termId_key" ON "public"."Registration"("userId", "lectureId", "termId");

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
