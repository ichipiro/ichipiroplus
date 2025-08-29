"use server";

import { prisma } from "@/lib/prisma";
import type { Term } from "@prisma/client";

/**
 * 全ての学期を取得
 */
export const getTerms = async (): Promise<Term[]> => {
  return await prisma.term.findMany({
    orderBy: [{ year: "desc" }, { number: "asc" }],
  });
};

/**
 * 特定年度の学期を取得
 */
export const getTermsByYear = async (year: number): Promise<Term[]> => {
  return await prisma.term.findMany({
    where: { year },
    orderBy: { number: "asc" },
  });
};

/**
 * 現在アクティブな学期を取得
 */
export const getCurrentTerm = async (): Promise<Term> => {
  const now = new Date();

  const currentTerm = await prisma.term.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: [{ year: "desc" }, { number: "desc" }],
  });

  if (!currentTerm) {
    throw new Error("学期が存在しません");
  }

  return currentTerm;
};

/**
 * 特定の学期を取得
 */
export const getTerm = async (termId: string): Promise<Term> => {
  const term = await prisma.term.findUnique({
    where: { id: termId },
  });

  if (!term) {
    throw new Error("学期が存在しません");
  }

  return term;
};
