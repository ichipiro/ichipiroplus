"use server";

import { getMe } from "@/features/user/actions";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getCurrentTerm, getTerm } from "./terms";

type SharedTimetableLecture = {
  id: string;
  name: string;
  instructor: string;
  room: string | null;
  schedules: { day: number; time: number }[];
};

export type SharedTimetableRegistration = {
  id: string;
  lectureId: string;
  attendanceCount: number;
  lecture: SharedTimetableLecture;
};

export const getTimetableByUserId = async ({
  userId,
  includePrivate,
  termId,
}: {
  userId: string;
  includePrivate: boolean;
  termId?: string;
}): Promise<{
  termId: string;
  termNumber: number;
  items: SharedTimetableRegistration[];
}> => {
  const term = termId ? await getTerm(termId) : await getCurrentTerm();

  const items = await prisma.registration.findMany({
    where: {
      userId,
      academicYear: term.academicYear,
      lecture: {
        lectureTerms: {
          some: { termNumber: term.number },
        },
        ...(includePrivate ? {} : { isPublic: true }),
      },
    },
    select: {
      id: true,
      lectureId: true,
      attendanceCount: true,
      lecture: {
        select: {
          id: true,
          name: true,
          instructor: true,
          room: true,
          schedules: {
            select: {
              day: true,
              time: true,
            },
            orderBy: [{ day: "asc" }, { time: "asc" }],
          },
        },
      },
    },
    orderBy: [{ lecture: { name: "asc" } }, { registeredAt: "asc" }],
  });

  return {
    termId: term.id,
    termNumber: term.number,
    items,
  };
};

export const copyTimetableFromUser = async (
  sourceUserId: string,
  termId: string,
): Promise<{ created: number; updated: number; total: number }> => {
  const targetUserId = await getMe();
  const term = await getTerm(termId);

  const sourceUser = await prisma.user.findUnique({
    where: { id: sourceUserId },
    select: {
      id: true,
      isTimetablePublic: true,
    },
  });

  if (!sourceUser) {
    throw new NotFoundError("コピー元ユーザー");
  }

  if (sourceUser.id !== targetUserId && !sourceUser.isTimetablePublic) {
    throw new ForbiddenError("このユーザーの時間割は非公開です");
  }

  const sourceRegistrations = await prisma.registration.findMany({
    where: {
      userId: sourceUser.id,
      academicYear: term.academicYear,
      lecture: {
        lectureTerms: {
          some: { termNumber: term.number },
        },
        isPublic: true,
      },
    },
    select: {
      lectureId: true,
      attendanceCount: true,
    },
  });

  if (sourceRegistrations.length === 0) {
    return { created: 0, updated: 0, total: 0 };
  }

  const existing = await prisma.registration.findMany({
    where: {
      userId: targetUserId,
      academicYear: term.academicYear,
      lectureId: { in: sourceRegistrations.map(r => r.lectureId) },
    },
    select: { lectureId: true },
  });
  const existingLectureIds = new Set(existing.map(r => r.lectureId));

  let created = 0;
  let updated = 0;

  await prisma.$transaction(async tx => {
    for (const source of sourceRegistrations) {
      const alreadyRegistered = existingLectureIds.has(source.lectureId);

      await tx.registration.upsert({
        where: {
          userId_lectureId_academicYear: {
            userId: targetUserId,
            lectureId: source.lectureId,
            academicYear: term.academicYear,
          },
        },
        create: {
          userId: targetUserId,
          lectureId: source.lectureId,
          academicYear: term.academicYear,
          attendanceCount: source.attendanceCount,
        },
        update: {
          attendanceCount: source.attendanceCount,
        },
      });

      if (alreadyRegistered) {
        updated += 1;
      } else {
        created += 1;
      }
    }
  });

  return {
    created,
    updated,
    total: sourceRegistrations.length,
  };
};

// backward compatibility
export const getCurrentTermTimetableByUserId = async ({
  userId,
  includePrivate,
}: {
  userId: string;
  includePrivate: boolean;
}) => getTimetableByUserId({ userId, includePrivate });

// backward compatibility
export const copyCurrentTermTimetableFromUser = async (
  sourceUserId: string,
) => {
  const term = await getCurrentTerm();
  return copyTimetableFromUser(sourceUserId, term.id);
};
