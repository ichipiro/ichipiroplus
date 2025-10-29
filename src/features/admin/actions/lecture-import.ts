"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  type ImportResult,
  type LectureImportData,
  LectureImportSchema,
} from "../types";

/**
 * JSONデータをバリデーション
 */
export const validateLectureData = async (
  jsonString: string
): Promise<{
  valid: boolean;
  data?: LectureImportData[];
  errors?: string[];
}> => {
  try {
    const jsonData = JSON.parse(jsonString);

    if (!Array.isArray(jsonData)) {
      return { valid: false, errors: ["データは配列形式である必要があります"] };
    }

    const validatedData: LectureImportData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      try {
        const validated = LectureImportSchema.parse(jsonData[i]);
        validatedData.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(
            `行 ${i + 1}: ${error.errors.map((e) => e.message).join(", ")}`
          );
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, data: validatedData };
  } catch (error) {
    return {
      valid: false,
      errors: [
        error instanceof Error ? error.message : "検証エラーが発生しました",
      ],
    };
  }
};

/**
 * シラバスデータをインポート
 */
export const importLectureData = async (
  jsonString: string
): Promise<ImportResult> => {
  try {
    // セッション情報を事前に取得
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "ユーザーIDが取得できません",
        errors: ["認証エラー"],
      };
    }
    const ownerId = session.user.id;

    // データの検証
    const validation = await validateLectureData(jsonString);

    if (!validation.valid || !validation.data) {
      return {
        success: false,
        message: "データ検証に失敗しました",
        errors: validation.errors,
      };
    }

    const data = validation.data;
    const departmentMap = await preloadDepartments(prisma, data);

    const missingDepartmentErrors = data
      .map((item) => {
        const missing = item.departments.filter(
          (name) => !departmentMap.has(name)
        );
        if (missing.length === 0) {
          return null;
        }
        const errorMsg = `ID: ${
          item.syllabusCode
        } - 未登録の学科: ${missing.join(", ")}`;
        console.error(errorMsg);
        return errorMsg;
      })
      .filter((msg): msg is string => Boolean(msg));

    if (missingDepartmentErrors.length > 0) {
      return {
        success: false,
        message: "存在しない学科が含まれているためインポートを中止しました",
        errors: missingDepartmentErrors,
      };
    }

    const operations: Prisma.PrismaPromise<unknown>[] = data.map((item) => {
      console.log(`Processing lecture: ${item.syllabusCode} - ${item.name}`);

      const scheduleIds = toScheduleIds(item.schedules);
      const departmentIds = item.departments
        .map((name) => departmentMap.get(name))
        .filter((id): id is string => Boolean(id));

      console.log(
        `Found ${departmentIds.length} departments for ${item.departments.join(
          ", "
        )}`
      );

      const lectureData = buildLectureData(
        item,
        ownerId,
        scheduleIds,
        departmentIds
      );

      return prisma.lecture.upsert({
        where: { syllabusCode: item.syllabusCode },
        create: lectureData,
        update: lectureData,
      });
    });

    await prisma.$transaction(operations);

    const lectureCount = data.length;
    console.log(
      `Successfully processed ${lectureCount}/${data.length} lectures`
    );

    return {
      success: true,
      message: `${lectureCount}件の講義データをインポートしました`,
      lectureCount,
    };
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "インポート中にエラーが発生しました",
      errors: [error instanceof Error ? error.message : "不明なエラー"],
    };
  }
};

const toScheduleIds = (schedules: LectureImportData["schedules"]) =>
  schedules.map(({ day, time }) => (day - 1) * 5 + time);

const connectById = <T extends string | number>(ids: T[]) =>
  ids.map((id) => ({ id }));

const buildLectureData = (
  item: LectureImportData,
  ownerId: string,
  scheduleIds: number[],
  departmentIds: string[]
) => ({
  syllabusCode: item.syllabusCode,
  name: item.name,
  instructor: item.instructor ?? "未定",
  room: item.room ?? null,
  grade: item.grade,
  units: item.units ?? 0,
  purpose: item.purpose ?? null,
  goal: item.goal ?? null,
  description: item.description ?? null,
  evalMethod: item.evalMethod ?? null,
  textbook: item.textbook ?? null,
  feedback: item.feedback ?? null,
  isRequired: item.isRequired,
  isExam: item.isExam,
  ownerId,
  sourceType: "scraped" as const,
  termNumbers: item.termNumbers,
  schedules: {
    connect: connectById(scheduleIds),
  },
  departments: {
    connect: connectById(departmentIds),
  },
});

const preloadDepartments = async (
  client: Prisma.TransactionClient | PrismaClient,
  items: LectureImportData[]
) => {
  const departmentNames = Array.from(
    new Set(items.flatMap((item) => item.departments))
  );

  if (departmentNames.length === 0) {
    return new Map<string, string>();
  }

  const departments = await client.department.findMany({
    where: { name: { in: departmentNames } },
  });

  return new Map(departments.map(({ name, id }) => [name, id]));
};
