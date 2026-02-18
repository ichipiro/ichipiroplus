import type { Lecture, Registration, Term } from "@prisma/client";

export type { Lecture, Registration, Term };

// Lecture form data
export interface LectureFormData {
  name: string;
  termNumbers: number[]; // 概念的ターム番号配列 [1, 2, 3, 4]
  period?: number | null;
  weekday?: number | null;
  room?: string | null;
  instructor?: string | null;
  credit?: number | null;
  code?: string | null;
  dayOfWeek?: number | null;
  grade?: number;
  biko?: string | null;
  syllabusCode?: string | null;
  isPublic?: boolean;
  isPublicEditable?: boolean;

  scheduleIds?: number[];
}

// Registration form data
export interface RegistrationFormData {
  termId: string; // Term ID
  attendance: number;
  absent: number;
  late: number;
}

// Term creation data for admin
export interface TermFormData {
  number: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

import { z } from "zod";

// Lecture form validation schema
export const lectureFormSchema = z.object({
  name: z.string().min(1, "講義名は必須です"),
  termNumbers: z.array(z.number().min(1).max(4)).min(1, "ターム番号は必須です"),
  period: z.number().min(1).max(7).nullable().optional(),
  weekday: z.number().min(1).max(7).nullable().optional(),
  room: z.string().nullable().optional(),
  instructor: z.string().nullable().optional(),
  credit: z.number().min(0).max(10).nullable().optional(),
  code: z.string().nullable().optional(),
  dayOfWeek: z.number().min(1).max(7).nullable().optional(),
  grade: z.number().min(1).max(6).optional(),
  biko: z.string().nullable().optional(),
  syllabusCode: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  isPublicEditable: z.boolean().optional(),

  scheduleIds: z.array(z.number()).optional(),
});

// Term form validation schema for admin
export const termFormSchema = z
  .object({
    number: z.number().min(1).max(4),
    name: z.string().min(1, "ターム名は必須です"),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine(data => data.endDate > data.startDate, {
    message: "終了日は開始日より後である必要があります",
    path: ["endDate"],
  });
