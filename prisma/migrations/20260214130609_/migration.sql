/*
  Warnings:

  - You are about to drop the column `termNumbers` on the `Lecture` table. All the data in the column will be lost.
  - The `sourceType` column on the `Lecture` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `PushNotificationLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `termId` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Term` table. All the data in the column will be lost.
  - You are about to drop the `_LectureToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,lectureId]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number]` on the table `Term` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `notificationType` on the `PushNotificationLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."SourceType" AS ENUM ('scraped', 'userCreated');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('task', 'article', 'system', 'lecture', 'test');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('sent', 'failed');

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_termId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LectureToUser" DROP CONSTRAINT "_LectureToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LectureToUser" DROP CONSTRAINT "_LectureToUser_B_fkey";

-- DropIndex
DROP INDEX "public"."Registration_userId_lectureId_termId_key";

-- DropIndex
DROP INDEX "public"."Term_year_number_key";

-- Ensure owner user exists for imported lectures
INSERT INTO "public"."User" (
  "id",
  "username",
  "displayName",
  "isProfileComplete",
  "isAdmin",
  "createdAt",
  "updatedAt"
)
SELECT
  'system',
  '__system__',
  'System',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."User" WHERE "id" = 'system'
);

-- CreateTable
CREATE TABLE "public"."LectureTerm" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "termNumber" INTEGER NOT NULL,

    CONSTRAINT "LectureTerm_pkey" PRIMARY KEY ("id")
);

-- Backfill LectureTerm from Lecture.termNumbers
INSERT INTO "public"."LectureTerm" ("id", "lectureId", "termNumber")
SELECT
  md5(random()::text || clock_timestamp()::text || "id" || term_number::text),
  "id",
  term_number
FROM "public"."Lecture",
LATERAL unnest(COALESCE("termNumbers", ARRAY[]::INTEGER[])) AS term_number;

-- Normalize sourceType values before enum migration
UPDATE "public"."Lecture"
SET "sourceType" = 'userCreated'
WHERE "sourceType" = 'user_created';

-- Alter sourceType without data loss
ALTER TABLE "public"."Lecture"
  ALTER COLUMN "sourceType" DROP DEFAULT,
  ALTER COLUMN "sourceType" TYPE "public"."SourceType"
  USING (
    CASE
      WHEN "sourceType" = 'userCreated' THEN 'userCreated'::"public"."SourceType"
      ELSE 'scraped'::"public"."SourceType"
    END
  ),
  ALTER COLUMN "sourceType" SET DEFAULT 'scraped';

-- Drop legacy term array column after backfill
ALTER TABLE "public"."Lecture" DROP COLUMN "termNumbers";

-- Alter notificationType/status without data loss
ALTER TABLE "public"."PushNotificationLog"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "notificationType" TYPE "public"."NotificationType"
  USING (
    CASE
      WHEN "notificationType" IN ('task', 'article', 'system', 'lecture', 'test')
        THEN "notificationType"::"public"."NotificationType"
      ELSE 'system'::"public"."NotificationType"
    END
  ),
  ALTER COLUMN "status" TYPE "public"."NotificationStatus"
  USING (
    CASE
      WHEN "status" = 'failed' THEN 'failed'::"public"."NotificationStatus"
      ELSE 'sent'::"public"."NotificationStatus"
    END
  ),
  ALTER COLUMN "status" SET DEFAULT 'sent';

-- Remove duplicate registrations before new unique constraint
WITH ranked_registration AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "lectureId"
      ORDER BY "updatedAt" DESC, "registeredAt" DESC, "id" DESC
    ) AS row_num
  FROM "public"."Registration"
)
DELETE FROM "public"."Registration"
WHERE "id" IN (
  SELECT "id" FROM ranked_registration WHERE row_num > 1
);

-- AlterTable
ALTER TABLE "public"."Registration" DROP COLUMN "termId";

-- Remove duplicate terms before new unique(number) constraint
WITH ranked_term AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "number"
      ORDER BY "updatedAt" DESC, "startDate" DESC, "id" DESC
    ) AS row_num
  FROM "public"."Term"
)
DELETE FROM "public"."Term"
WHERE "id" IN (
  SELECT "id" FROM ranked_term WHERE row_num > 1
);

-- AlterTable
ALTER TABLE "public"."Term" DROP COLUMN "year";

-- DropTable
DROP TABLE "public"."_LectureToUser";

-- CreateIndex
CREATE INDEX "LectureTerm_termNumber_idx" ON "public"."LectureTerm"("termNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LectureTerm_lectureId_termNumber_key" ON "public"."LectureTerm"("lectureId", "termNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_lectureId_key" ON "public"."Registration"("userId", "lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "Term_number_key" ON "public"."Term"("number");

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LectureTerm" ADD CONSTRAINT "LectureTerm_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
