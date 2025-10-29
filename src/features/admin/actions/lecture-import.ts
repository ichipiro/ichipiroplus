"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
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
    let lectureCount = 0;
    const errors: string[] = [];

    // トランザクションで一括処理
    await prisma.$transaction(async (tx) => {
      for (const item of data) {
        try {
          console.log(
            `Processing lecture: ${item.syllabusCode} - ${item.name}`
          );

          await upsertLectureFromImport(tx, item, ownerId);

          lectureCount++;
          console.log(
            `Successfully processed lecture ${lectureCount}/${data.length}`
          );
        } catch (error) {
          const errorMsg = `ID: ${item.syllabusCode} - ${
            error instanceof Error ? error.message : String(error)
          }`;
          errors.push(errorMsg);
          console.error(errorMsg);
          throw error; // トランザクションをロールバック
        }
      }
    });

    return {
      success: true,
      message: `${lectureCount}件の講義データをインポートしました`,
      lectureCount,
      errors: errors.length > 0 ? errors : undefined,
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

type LectureWriteData = ReturnType<typeof buildLectureData>;

const upsertLecture = async (
  tx: Prisma.TransactionClient,
  syllabusCode: string,
  data: LectureWriteData
) => {
  const existing = await tx.lecture.findUnique({
    where: { syllabusCode },
  });

  if (existing) {
    console.log(`Updating existing lecture: ${existing.id}`);
    await tx.lecture.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  console.log(`Creating new lecture: ${syllabusCode}`);
  await tx.lecture.create({
    data,
  });
};

const upsertLectureFromImport = async (
  tx: Prisma.TransactionClient,
  item: LectureImportData,
  ownerId: string
) => {
  const scheduleIds = toScheduleIds(item.schedules);
  const departments = await tx.department.findMany({
    where: { name: { in: item.departments } },
  });

  console.log(
    `Found ${departments.length} departments for ${item.departments.join(", ")}`
  );

  const lectureData = buildLectureData(
    item,
    ownerId,
    scheduleIds,
    departments.map(({ id }) => id)
  );

  await upsertLecture(tx, item.syllabusCode, lectureData);
};
