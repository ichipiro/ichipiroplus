"use server";

import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import { getMe } from "@/features/user/actions";
import type { Lecture, LectureFormData } from "../types";

type LectureCatalogItem = {
  id: string;
  syllabusCode: string | null;
  name: string;
  instructor: string;
  room: string | null;
  grade: number;
  updatedAt: Date;
  lectureTerms: { termNumber: number }[];
  schedules: { day: number; time: number }[];
};

type LectureCatalogDetail = {
  id: string;
  syllabusCode: string | null;
  name: string;
  instructor: string;
  room: string | null;
  grade: number;
  units: number;
  purpose: string | null;
  goal: string | null;
  description: string | null;
  evalMethod: string | null;
  textbook: string | null;
  feedback: string | null;
  biko: string | null;
  isRequired: boolean;
  isExam: boolean;
  isPublic: boolean;
  isPublicEditable: boolean;
  lectureTerms: { termNumber: number }[];
  schedules: { day: number; time: number }[];
  departments: { id: string; name: string }[];
  owner: { id: string; displayName: string; username: string };
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 全ての講義を取得（フィルタリング可能）
 */
export const getLectures = async (params?: {
  day?: number;
  time?: number;
  termNumber?: number; // 概念的ターム番号 (1-4)
}): Promise<Lecture[]> => {
  const lectures = await prisma.lecture.findMany({
    where: {
      ...(params?.termNumber && {
        lectureTerms: {
          some: {
            termNumber: params.termNumber,
          },
        },
      }),
      ...(params?.day &&
        params?.time && {
          schedules: {
            some: {
              day: params.day,
              time: params.time,
            },
          },
        }),
      isPublic: true,
      isPublicEditable: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return lectures;
};

export const getLectureCatalogPage = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<{ lectures: LectureCatalogItem[]; totalCount: number }> => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 50;
  const skip = (safePage - 1) * safePageSize;

  const [lectures, totalCount] = await Promise.all([
    prisma.lecture.findMany({
      where: {
        isPublic: true,
      },
      orderBy: [{ name: "asc" }, { updatedAt: "desc" }],
      skip,
      take: safePageSize,
      select: {
        id: true,
        syllabusCode: true,
        name: true,
        instructor: true,
        room: true,
        grade: true,
        updatedAt: true,
        lectureTerms: {
          select: {
            termNumber: true,
          },
          orderBy: {
            termNumber: "asc",
          },
        },
        schedules: {
          select: {
            day: true,
            time: true,
          },
          orderBy: [{ day: "asc" }, { time: "asc" }],
        },
      },
    }),
    prisma.lecture.count({
      where: {
        isPublic: true,
      },
    }),
  ]);

  return { lectures, totalCount };
};

/**
 * 特定の講義を取得
 */
export const getLectureById = async (lectureId: string): Promise<Lecture> => {
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    throw new NotFoundError("講義");
  }

  return lecture;
};

export const getLectureCatalogDetail = async (
  lectureId: string,
): Promise<LectureCatalogDetail> => {
  const userId = await getMe();

  const lecture = await prisma.lecture.findFirst({
    where: {
      id: lectureId,
      OR: [{ isPublic: true }, { ownerId: userId }],
    },
    select: {
      id: true,
      syllabusCode: true,
      name: true,
      instructor: true,
      room: true,
      grade: true,
      units: true,
      purpose: true,
      goal: true,
      description: true,
      evalMethod: true,
      textbook: true,
      feedback: true,
      biko: true,
      isRequired: true,
      isExam: true,
      isPublic: true,
      isPublicEditable: true,
      lectureTerms: {
        select: {
          termNumber: true,
        },
        orderBy: {
          termNumber: "asc",
        },
      },
      schedules: {
        select: {
          day: true,
          time: true,
        },
        orderBy: [{ day: "asc" }, { time: "asc" }],
      },
      departments: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      owner: {
        select: {
          id: true,
          displayName: true,
          username: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!lecture) {
    throw new NotFoundError("講義");
  }

  return lecture;
};

/**
 * 特定の時間帯と学期の講義を取得
 */
export const getLecturesByTimeAndTerm = async (
  day: number,
  time: number,
  termNumber: number,
): Promise<Lecture[]> => {
  const lectures = await prisma.lecture.findMany({
    where: {
      schedules: {
        some: {
          day,
          time,
        },
      },
      lectureTerms: {
        some: {
          termNumber,
        },
      },
      isPublic: true,
    },
  });

  return lectures;
};

/**
 * 新しい講義を作成
 */
export const createLecture = async (
  data: LectureFormData,
): Promise<Lecture> => {
  const userId = await getMe();

  const lecture = await prisma.$transaction(async tx => {
    const created = await tx.lecture.create({
      data: {
        name: data.name,
        room: data.room,
        grade: data.grade || 1,
        instructor: data.instructor || "",
        biko: data.biko,
        syllabusCode: data.syllabusCode,
        ownerId: userId,
        sourceType: "userCreated",
        isPublic: data.isPublic ?? true,
        isPublicEditable: data.isPublicEditable ?? true,
        schedules: {
          connect: data.scheduleIds?.map(id => ({ id })) || [],
        },
      },
    });

    if (data.termNumbers?.length) {
      await tx.lectureTerm.createMany({
        data: data.termNumbers.map(termNumber => ({
          lectureId: created.id,
          termNumber,
        })),
        skipDuplicates: true,
      });
    }

    return created;
  });

  return lecture;
};

/**
 * 講義の内容を更新
 */
export const updateLecture = async (
  lectureId: string,
  data: Partial<LectureFormData>,
): Promise<Lecture> => {
  const userId = await getMe();

  // 権限チェック
  const existingLecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: {
      ownerId: true,
      isPublicEditable: true,
    },
  });

  if (!existingLecture) {
    throw new NotFoundError("講義");
  }

  // 所有者でない場合、編集可能かチェック
  if (existingLecture.ownerId !== userId && !existingLecture.isPublicEditable) {
    throw new ForbiddenError("この講義を編集する権限がありません");
  }
  const isOwner = existingLecture.ownerId === userId;

  if (
    !isOwner &&
    (data.isPublic !== undefined || data.isPublicEditable !== undefined)
  ) {
    throw new ForbiddenError("公開設定を変更できるのは講義オーナーのみです");
  }

  const lecture = await prisma.$transaction(async tx => {
    const updated = await tx.lecture.update({
      where: { id: lectureId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.room !== undefined && { room: data.room }),
        ...(data.grade !== undefined && { grade: data.grade }),
        ...(data.instructor !== undefined && {
          instructor: data.instructor ?? "",
        }),
        ...(data.biko !== undefined && { biko: data.biko }),
        ...(data.syllabusCode !== undefined && {
          syllabusCode: data.syllabusCode,
        }),
        ...(isOwner &&
          data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(isOwner &&
          data.isPublicEditable !== undefined && {
            isPublicEditable: data.isPublicEditable,
          }),
        ...(data.scheduleIds !== undefined && {
          schedules: {
            set: [],
            connect: data.scheduleIds.map(id => ({ id })),
          },
        }),
      },
    });

    if (data.termNumbers !== undefined) {
      await tx.lectureTerm.deleteMany({
        where: { lectureId },
      });

      if (data.termNumbers.length > 0) {
        await tx.lectureTerm.createMany({
          data: data.termNumbers.map(termNumber => ({
            lectureId,
            termNumber,
          })),
          skipDuplicates: true,
        });
      }
    }

    return updated;
  });

  return lecture;
};

/**
 * 講義を削除
 */
export const deleteLecture = async (lectureId: string): Promise<void> => {
  const userId = await getMe();

  // 所有者チェック
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: { ownerId: true },
  });

  if (!lecture) {
    throw new NotFoundError("講義");
  }

  if (lecture.ownerId !== userId) {
    throw new ForbiddenError("この講義を削除する権限がありません");
  }

  await prisma.lecture.delete({
    where: { id: lectureId },
  });
};

/**
 * ユーザーが講義を編集可能かどうかをチェック
 */
export const canEditLecture = async (lectureId: string): Promise<boolean> => {
  const userId = await getMe();

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: {
      ownerId: true,
      isPublicEditable: true,
    },
  });

  if (!lecture) {
    return false;
  }

  // 所有者または公開編集可能な場合は編集可能
  return lecture.ownerId === userId || lecture.isPublicEditable;
};
