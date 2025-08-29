"use server";

import { getMe } from "@/features/user/actions";
import { prisma } from "@/lib/prisma";

/**
 * 出席回数を増やす
 */
export const incrementAttendance = async (
  registrationId: string,
): Promise<number> => {
  const userId = await getMe();

  // 自分の登録かチェック
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
      userId,
    },
    select: { attendanceCount: true },
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  // 最大15回まで
  if (registration.attendanceCount >= 15) {
    throw new Error("Maximum attendance count reached");
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      attendanceCount: {
        increment: 1,
      },
    },
  });

  return updated.attendanceCount;
};

/**
 * 出席回数を減らす
 */
export const decrementAttendance = async (
  registrationId: string,
): Promise<number> => {
  const userId = await getMe();

  // 自分の登録かチェック
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
      userId,
    },
    select: { attendanceCount: true },
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  // 最小0回まで
  if (registration.attendanceCount <= 0) {
    throw new Error("Attendance count is already 0");
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      attendanceCount: {
        decrement: 1,
      },
    },
  });

  return updated.attendanceCount;
};
