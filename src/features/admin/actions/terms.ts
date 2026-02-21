"use server";

import type { TermFormData } from "@/features/timetable/types";
import { checkAdminAccess } from "@/lib/admin";
import { BadRequestError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 学期を作成または更新
 */
export async function upsertTerm(data: TermFormData) {
  await checkAdminAccess();

  // 基本バリデーション
  if (data.endDate <= data.startDate) {
    throw new BadRequestError("終了日は開始日より後である必要があります");
  }

  // 同じターム番号の既存データを確認
  const existing = await prisma.term.findUnique({
    where: {
      number: data.number,
    },
  });

  // 期間重複チェック
  const overlapping = await prisma.term.findMany({
    where: {
      ...(existing && { id: { not: existing.id } }),
      OR: [
        // 新しい開始日が既存期間内にある
        {
          AND: [
            { startDate: { lte: data.startDate } },
            { endDate: { gte: data.startDate } },
          ],
        },
        // 新しい終了日が既存期間内にある
        {
          AND: [
            { startDate: { lte: data.endDate } },
            { endDate: { gte: data.endDate } },
          ],
        },
        // 新しい期間が既存期間を包含する
        {
          AND: [
            { startDate: { gte: data.startDate } },
            { endDate: { lte: data.endDate } },
          ],
        },
      ],
    },
  });

  if (overlapping.length > 0) {
    const overlappingNames = overlapping.map(term => term.name).join(", ");
    throw new BadRequestError(
      `期間が重複している学期があります: ${overlappingNames}`,
    );
  }

  // アクティブ期間の重複チェック（現在時刻での判定）
  const now = new Date();
  const wouldBeActive = now >= data.startDate && now <= data.endDate;

  if (wouldBeActive) {
    const currentlyActive = await prisma.term.findMany({
      where: {
        ...(existing && { id: { not: existing.id } }),
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (currentlyActive.length > 0) {
      const activeNames = currentlyActive.map(term => term.name).join(", ");
      throw new BadRequestError(
        `既にアクティブな学期があります: ${activeNames}。期間が重複しないようにしてください。`,
      );
    }
  }

  if (existing) {
    // 更新
    const updated = await prisma.term.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    revalidatePath("/admin/terms");
    return updated;
  }
  // 新規作成
  const created = await prisma.term.create({
    data: {
      number: data.number,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });

  revalidatePath("/admin/terms");
  return created;
}

/**
 * 学期を削除
 */
export async function deleteTerm(termId: string) {
  await checkAdminAccess();

  await prisma.term.delete({
    where: { id: termId },
  });

  revalidatePath("/admin/terms");
}

/**
 * 学期期間の重複チェック
 */
export async function validateTermDates(
  number: number,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
) {
  await checkAdminAccess();

  // 同じ年度内で期間が重複する学期をチェック
  const overlapping = await prisma.term.findMany({
    where: {
      number,
      ...(excludeId && { id: { not: excludeId } }),
      OR: [
        // 新しい開始日が既存期間内にある
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } },
          ],
        },
        // 新しい終了日が既存期間内にある
        {
          AND: [{ startDate: { lte: endDate } }, { endDate: { gte: endDate } }],
        },
        // 新しい期間が既存期間を包含する
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
      ],
    },
  });

  return overlapping.length === 0;
}
