/*
  Warnings:

  - You are about to drop the column `isUserModified` on the `Lecture` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Lecture" DROP COLUMN "isUserModified",
ADD COLUMN     "isPublicEditable" BOOLEAN NOT NULL DEFAULT true;
