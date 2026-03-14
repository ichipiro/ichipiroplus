import type { PrismaClient } from "@prisma/client";
import { getScheduleKey } from "@/features/timetable/utils";
import { getAcademicYear } from "@/lib/academic-year";
import { readJson } from "@/lib/read-json";

type LectureSchedule = { day: number; time: number };
type LectureJson = {
  id: string; // syllabusCode 相当
  name: string;
  instructor?: string;
  room?: string | null;
  grade: number;
  units?: number;
  purpose?: string | null;
  goal?: string | null;
  description?: string | null;
  eval_method?: string | null;
  textbook?: string | null;
  feedback?: string | null;
  is_required: boolean;
  is_exam: boolean;
  schedules: LectureSchedule[];
  departments: string[]; // 部門名の配列
  terms: number[]; // 概念ターム番号 (1..3)
};

export const seedLectures = async (
  prisma: PrismaClient,
  academicYear = getAcademicYear(),
) => {
  console.log("講義データをインポート...");

  const items = await readJson<LectureJson[]>("data/lecture.json", import.meta.url);

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const scheduleIds = item.schedules.map((schedule) =>
        getScheduleKey(schedule.day, schedule.time),
      );

      const departments = await tx.department.findMany({
        where: { name: { in: item.departments } },
        select: { id: true, name: true },
      });

      // 見つからなかった学科があれば警告
      const foundNames = new Set(departments.map((d) => d.name));
      const missing = item.departments.filter((n) => !foundNames.has(n));
      if (missing.length > 0) {
        console.warn(
          `未登録の学科名: ${missing.join(", ")} (lecture: ${item.id})`,
        );
      }

      const data = {
        syllabusCode: item.id,
        academicYear,
        name: item.name,
        instructor: item.instructor ?? "未定",
        room: item.room ?? null,
        grade: item.grade ?? 1,
        units: item.units ?? 0,
        purpose: item.purpose ?? null,
        goal: item.goal ?? null,
        description: item.description ?? null,
        evalMethod: item.eval_method ?? null,
        textbook: item.textbook ?? null,
        feedback: item.feedback ?? null,
        isRequired: item.is_required,
        isExam: item.is_exam,
        ownerId: "system", // シード元識別
        sourceType: "scraped",
      } as const;

      const lecture = await tx.lecture.upsert({
        where: {
          syllabusCode_academicYear: {
            syllabusCode: item.id,
            academicYear,
          },
        },
        create: {
          ...data,
          schedules: { connect: scheduleIds.map((id) => ({ id })) },
          departments: { connect: departments.map((d) => ({ id: d.id })) },
        },
        update: {
          ...data,
          schedules: { set: scheduleIds.map((id) => ({ id })) },
          departments: { set: departments.map((d) => ({ id: d.id })) },
        },
      });

      await tx.lectureTerm.deleteMany({
        where: { lectureId: lecture.id },
      });

      if (item.terms.length > 0) {
        await tx.lectureTerm.createMany({
          data: item.terms.map((termNumber) => ({
            lectureId: lecture.id,
            termNumber,
          })),
          skipDuplicates: true,
        });
      }
    }
  });

  console.log(`Lecture データをインポート完了: ${items.length}件`);
};
