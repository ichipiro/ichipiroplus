import { z } from "zod";
import { DEFAULT_TASK_REMINDER_OFFSETS } from "../constants";

export const TaskStatus = {
  INCOMPLETE: 1,
  DONE: 2,
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export const taskFormSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  registrationId: z.string().nullable().optional(),
  status: z.number().min(1).max(2).default(TaskStatus.INCOMPLETE),
  dueDate: z.date().nullable().optional(),
  reminderOffsets: z
    .array(z.number().int().positive())
    .max(3)
    .default(DEFAULT_TASK_REMINDER_OFFSETS),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: Date | string;
  registrationId?: string | null;
  reminderOffsets?: number[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatusType;
}
