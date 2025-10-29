import { z } from "zod";

export const LectureImportSchema = z.object({
  syllabusCode: z.string(),
  name: z.string(),
  instructor: z.string().nullable().optional(),
  grade: z.number().default(1),
  units: z.number().default(0).optional(),
  purpose: z.string().nullable().optional(),
  goal: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  evalMethod: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  textbook: z.string().nullable().optional(),
  isRequired: z.boolean().default(false),
  isExam: z.boolean().default(false),
  schedules: z
    .array(
      z.object({
        day: z.number().min(1).max(5),
        time: z.number().min(1).max(5),
      }),
    )
    .default([]),
  departments: z.array(z.string()).default([]),
  termNumbers: z.array(z.number().min(1).max(4)).default([]),
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
