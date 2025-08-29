-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "facultyId" TEXT,
ADD COLUMN     "grade" INTEGER,
ADD COLUMN     "introduction" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
