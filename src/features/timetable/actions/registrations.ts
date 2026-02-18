"use server";

import { getMe } from "@/features/user/actions";
import { auth } from "@/lib/auth";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { Registration } from "@prisma/client";

/**
 * ユーザーの登録済み講義を取得
 */
export const getMyRegistrations = async (
  termId: string,
): Promise<Registration[]> => {
  const userId = await getMe();

  const term = await prisma.term.findUnique({
    where: { id: termId },
    select: { number: true },
  });

  if (!term) {
    return [];
  }

  return await prisma.registration.findMany({
    where: {
      userId,
      lecture: {
        lectureTerms: {
          some: { termNumber: term.number },
        },
      },
    },
    orderBy: { registeredAt: "desc" },
  });
};

/**
 * 特定の時間帯の登録済み講義を取得
 */
export const getRegistrationsBySchedule = async (
  schedule: number,
  termId: string,
): Promise<Registration | null> => {
  const userId = await getMe();
  const term = await prisma.term.findUnique({
    where: { id: termId },
    select: { number: true },
  });

  if (!term) {
    return null;
  }

  return await prisma.registration.findFirst({
    where: {
      userId,
      lecture: {
        lectureTerms: {
          some: { termNumber: term.number },
        },
        schedules: {
          some: { id: schedule },
        },
      },
    },
  });
};

/**
 * 指定ユーザーの特定時間帯の登録済み講義を取得（公開設定を考慮）
 */
export const getRegistrationByScheduleForUser = async (
  schedule: number,
  termId: string,
  userId: string,
): Promise<Registration | null> => {
  const [session, targetUser, term] = await Promise.all([
    auth(),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isTimetablePublic: true },
    }),
    prisma.term.findUnique({
      where: { id: termId },
      select: { number: true },
    }),
  ]);

  if (!targetUser || !term) {
    return null;
  }

  const isOwner = session?.user?.id === userId;
  if (!isOwner && !targetUser.isTimetablePublic) {
    return null;
  }

  return await prisma.registration.findFirst({
    where: {
      userId,
      lecture: {
        lectureTerms: {
          some: { termNumber: term.number },
        },
        schedules: {
          some: { id: schedule },
        },
        ...(isOwner ? {} : { isPublic: true }),
      },
    },
  });
};

/**
 * 登録情報を取得
 */
export const getRegistration = async (id: string): Promise<Registration> => {
  const userId = await getMe();

  const data = await prisma.registration.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!data) {
    throw new NotFoundError("講義登録");
  }

  return data;
};

/**
 * 講義に登録
 */
export const registerForLecture = async (
  lectureId: string,
  termId: string,
): Promise<Registration> => {
  const userId = await getMe();
  const term = await prisma.term.findUnique({
    where: { id: termId },
    select: { number: true },
  });

  if (!term) {
    throw new NotFoundError("学期");
  }

  // 講義の情報を取得
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: {
      lectureTerms: true,
    },
  });

  if (!lecture) {
    throw new NotFoundError("講義");
  }
  if (!lecture.lectureTerms.some(lt => lt.termNumber === term.number)) {
    throw new BadRequestError("この学期では登録できない講義です");
  }

  // 既に登録済みかチェック
  const existing = await prisma.registration.findUnique({
    where: {
      userId_lectureId: {
        userId: userId,
        lectureId: lectureId,
      },
    },
  });

  if (existing) {
    throw new ConflictError("既にこの講義に登録済みです");
  }

  const registration = await prisma.registration.create({
    data: {
      userId: userId,
      lectureId: lectureId,
      attendanceCount: 0,
    },
  });

  return registration;
};

/**
 * 講義登録を削除
 */
export const unregisterById = async (id: string): Promise<void> => {
  const userId = await getMe();

  await prisma.registration.deleteMany({
    where: {
      userId,
      id,
    },
  });
};
