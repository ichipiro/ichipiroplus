import type { Department, Faculty, User } from "@prisma/client";
import { z } from "zod";

export type { Department, Faculty, User };

export type UserWithRelations = User & {
  faculty: Faculty | null;
  department: Department | null;
};

export const UserFormSchema = z.object({
  username: z.string().min(1, "ユーザー名は必須です"),
  displayName: z.string().min(1, "名前は必須です"),
  introduction: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  grade: z.number().min(1).max(6).optional(),
  image: z.string().nullable().optional(),
});

export type UserFormData = z.infer<typeof UserFormSchema>;
