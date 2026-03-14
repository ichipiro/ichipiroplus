"use server";

import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { Term } from "@prisma/client";

/**
 * 全ての学期を取得
 */
export const getTerms = async (): Promise<Term[]> => {
  return await prisma.term.findMany({
    orderBy: [{ academicYear: "desc" }, { number: "asc" }],
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
    orderBy: [{ academicYear: "desc" }, { number: "asc" }],
  });

  if (currentTerm) {
    return currentTerm;
  }

  const nextTerm = await prisma.term.findFirst({
    where: {
      startDate: { gt: now },
    },
    orderBy: { startDate: "asc" },
  });

  if (nextTerm) {
    return nextTerm;
  }

  const lastTerm = await prisma.term.findFirst({
    where: {
      endDate: { lt: now },
    },
    orderBy: { endDate: "desc" },
  });

  if (lastTerm) {
    return lastTerm;
  }

  throw new NotFoundError("学期");
};

/**
 * 特定の学期を取得
 */
export const getTerm = async (termId: string): Promise<Term> => {
  const term = await prisma.term.findUnique({
    where: { id: termId },
  });

  if (!term) {
    throw new NotFoundError("学期");
  }

  return term;
};
