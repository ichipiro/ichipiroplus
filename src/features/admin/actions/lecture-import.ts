"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
          console.log(`Processing lecture: ${item.id} - ${item.name}`);
          // スケジュールIDを計算（正しい計算式に修正）
          const scheduleIds = item.schedules.map((sch) => {
            // day: 1-5, time: 1-7
            // IDは1から始まる連番
            const id = (sch.day - 1) * 5 + sch.time;
            console.log(`Schedule: day=${sch.day}, time=${sch.time}, id=${id}`);
            return id;
          });

          // 部門データの取得
          const departments = await tx.department.findMany({
            where: { name: { in: item.departments } },
          });
          console.log(
            `Found ${
              departments.length
            } departments for ${item.departments.join(", ")}`
          );

          // 講義データの作成
          const lectureData = {
            syllabusCode: item.id,
            name: item.name,
            instructor: item.instructor || "未定",
            room: item.room || null,
            grade: item.grade,
            units: item.units || 0,
            purpose: item.purpose || null,
            goal: item.goal || null,
            description: item.description || null,
            evalMethod: item.eval_method || null,
            textbook: item.textbook || null,
            feedback: item.feedback || null,
            isRequired: item.is_required,
            isExam: item.is_exam,
            ownerId: ownerId,
            sourceType: "scraped",
            termNumbers: item.terms, // 概念的ターム番号配列に直接設定
            schedules: {
              connect: scheduleIds.map((id) => ({ id })),
            },
            departments: {
              connect: departments.map((d) => ({ id: d.id })),
            },
          };

          const existingLecture = await tx.lecture.findUnique({
            where: { syllabusCode: item.id },
          });

          if (existingLecture) {
            console.log(`Updating existing lecture: ${existingLecture.id}`);
            await tx.lecture.update({
              where: { id: existingLecture.id },
              data: lectureData,
            });
          } else {
            console.log(`Creating new lecture: ${item.id}`);
            await tx.lecture.create({
              data: lectureData,
            });
          }
          lectureCount++;
          console.log(
            `Successfully processed lecture ${lectureCount}/${data.length}`
          );
        } catch (error) {
          const errorMsg = `ID: ${item.id} - ${
            error instanceof Error ? error.message : String(error)
          }`;
          errors.push(errorMsg);
          console.error(errorMsg);
          // エラーが発生してもトランザクション全体を失敗させない
          // 必要に応じてthrowしてロールバックさせる
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
