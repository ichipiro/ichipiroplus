import { z } from "zod";

export const LectureImportSchema = z.object({
  id: z.string(), // syllabusCode として使用
  name: z.string(),
  instructor: z.string().nullable().optional(),
  grade: z.number().default(1),
  units: z.number().default(0).optional(),
  purpose: z.string().nullable().optional(),
  goal: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  eval_method: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  textbook: z.string().nullable().optional(),
  is_required: z.boolean().default(false),
  is_exam: z.boolean().default(false),
  schedules: z
    .array(
      z.object({
        day: z.number().min(1).max(5),
        time: z.number().min(1).max(5),
      }),
    )
    .default([]),
  departments: z.array(z.string()).default([]),
  terms: z.array(z.number().min(1).max(4)).default([]),
  room: z.string().nullable().optional(),
});

export type LectureImportData = z.infer<typeof LectureImportSchema>;

export type ImportResult = {
  success: boolean;
  message: string;
  lectureCount?: number;
  errors?: string[];
  stats?: {
    lectures: number;
    rooms?: number;
    teachers?: number;
  };
};
