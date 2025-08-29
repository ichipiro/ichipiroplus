"use server";

import { prisma } from "@/lib/prisma";

import { getMe } from "@/features/user/actions";
import type { Lecture, LectureFormData } from "../types";

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
        termNumbers: {
          has: params.termNumber,
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

/**
 * 特定の講義を取得
 */
export const getLectureById = async (lectureId: string): Promise<Lecture> => {
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    throw new Error("Lecture not found");
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
      termNumbers: {
        has: termNumber,
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

  const lecture = await prisma.lecture.create({
    data: {
      name: data.name,
      room: data.room,
      grade: data.grade || 1,
      instructor: data.instructor || "",
      biko: data.biko,
      syllabusCode: data.syllabusCode,
      ownerId: userId,
      isPublic: data.isPublic ?? true,
      isPublicEditable: data.isPublicEditable ?? true,
      termNumbers: data.termNumbers || [],

      schedules: {
        connect: data.scheduleIds?.map(id => ({ id })) || [],
      },
    },
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
    throw new Error("Lecture not found");
  }

  // 所有者でない場合、編集可能かチェック
  if (existingLecture.ownerId !== userId && !existingLecture.isPublicEditable) {
    throw new Error("Forbidden");
  }

  const lecture = await prisma.lecture.update({
    where: { id: lectureId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.room !== undefined && { room: data.room }),
      ...(data.grade !== undefined && { grade: data.grade }),
      ...(data.instructor && { instructor: data.instructor }),
      ...(data.biko !== undefined && { biko: data.biko }),
      ...(data.syllabusCode !== undefined && {
        syllabusCode: data.syllabusCode,
      }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      ...(data.isPublicEditable !== undefined && {
        isPublicEditable: data.isPublicEditable,
      }),
      ...(data.termNumbers !== undefined && {
        termNumbers: data.termNumbers,
      }),
      ...(data.scheduleIds && {
        schedules: {
          set: [],
          connect: data.scheduleIds.map(id => ({ id })),
        },
      }),
    },
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
    throw new Error("Lecture not found");
  }

  if (lecture.ownerId !== userId) {
    throw new Error("Forbidden");
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
