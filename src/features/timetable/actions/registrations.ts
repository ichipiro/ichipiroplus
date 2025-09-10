"use server";

import { getMe } from "@/features/user/actions";
import { prisma } from "@/lib/prisma";

import type { RegistrationWithRelations } from "../types";

/**
 * ユーザーの登録済み講義を取得
 */
export const getMyRegistrations = async (
  termId: string,
): Promise<RegistrationWithRelations[]> => {
  const userId = await getMe();

  return await prisma.registration.findMany({
    where: {
      userId,
      termId,
    },
    orderBy: { registeredAt: "desc" },
    include: {
      lecture: {
        include: {
          schedules: true,
          departments: true,
        },
      },
      term: true,
      user: {
        include: {
          faculty: true,
          department: true,
        },
      },
    },
  });
};

/**
 * 特定の時間帯の登録済み講義を取得
 */
export const getRegistrationsBySchedule = async (
  schedule: number,
  termId: string,
): Promise<RegistrationWithRelations | null> => {
  const userId = await getMe();

  return await prisma.registration.findFirst({
    where: {
      userId,
      termId,
      lecture: {
        schedules: {
          some: { id: schedule },
        },
      },
    },
    include: {
      lecture: {
        include: {
          schedules: true,
          departments: true,
        },
      },
      term: true,
      user: {
        include: {
          faculty: true,
          department: true,
        },
      },
    },
  });
};

/**
 * 登録情報を取得
 */
export const getRegistration = async (
  id: string,
): Promise<RegistrationWithRelations> => {
  const userId = await getMe();

  const data = await prisma.registration.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      lecture: {
        include: {
          schedules: true,
          departments: true,
        },
      },
      term: true,
      user: {
        include: {
          faculty: true,
          department: true,
        },
      },
    },
  });

  if (!data) {
    throw new Error("Registration not found");
  }

  return data;
};

/**
 * 講義に登録
 */
export const registerForLecture = async (
  lectureId: string,
  termId: string,
): Promise<RegistrationWithRelations> => {
  const userId = await getMe();

  // 講義の情報を取得
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    throw new Error("講義が見つかりません");
  }

  // 既に登録済みかチェック
  const existing = await prisma.registration.findUnique({
    where: {
      userId_lectureId_termId: {
        userId: userId,
        lectureId: lectureId,
        termId,
      },
    },
  });

  if (existing) {
    throw new Error("既にこの講義に登録済みです");
  }

  const registration = await prisma.registration.create({
    data: {
      userId: userId,
      lectureId: lectureId,
      termId,
      attendanceCount: 0,
    },
    include: {
      lecture: {
        include: {
          schedules: true,
          departments: true,
        },
      },
      term: true,
      user: {
        include: {
          faculty: true,
          department: true,
        },
      },
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
