import type { Lecture, Registration, Task } from "@prisma/client";
import { z } from "zod";

export type TaskWithRelations = Task & {
  registration?:
    | (Registration & {
        lecture: Lecture;
      })
    | null;
};

export const TaskStatus = {
  TODO: 1,
  IN_PROGRESS: 2,
  DONE: 3,
} as const;

export const TaskPriority = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

// Form validation schema - プロジェクト標準に合わせる
export const taskFormSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  registrationId: z.string().nullable().optional(),
  priority: z.number().min(1).max(3).default(TaskPriority.MEDIUM),
  status: z.number().min(1).max(3).default(TaskStatus.TODO),
  dueDate: z.date().nullable().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

// Server Actions用の型（より明確に）
export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: Date | string;
  priority?: TaskPriorityType;
  registrationId?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatusType;
}
