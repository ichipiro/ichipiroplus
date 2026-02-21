-- AlterTable
ALTER TABLE "Task"
ADD COLUMN "reminderOffsets" INTEGER[] NOT NULL DEFAULT ARRAY[1440]::INTEGER[];

-- CreateTable
CREATE TABLE "TaskReminderDelivery" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "offsetMinutes" INTEGER NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "triggeredAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TaskReminderDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskReminderDelivery_taskId_offsetMinutes_dueDate_key"
ON "TaskReminderDelivery"("taskId", "offsetMinutes", "dueDate");

-- CreateIndex
CREATE INDEX "TaskReminderDelivery_userId_sentAt_idx"
ON "TaskReminderDelivery"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "TaskReminderDelivery_triggeredAt_idx"
ON "TaskReminderDelivery"("triggeredAt");

-- AddForeignKey
ALTER TABLE "TaskReminderDelivery"
ADD CONSTRAINT "TaskReminderDelivery_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskReminderDelivery"
ADD CONSTRAINT "TaskReminderDelivery_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
