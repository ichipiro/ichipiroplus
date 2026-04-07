"use server";

import { auth, unstable_update } from "@/lib/auth";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { Department, Faculty } from "@prisma/client";
import type { UserWithRelations } from "../types";

export const getMe = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session.user.id;
};

/**
 * 現在ログイン中のユーザーを取得
 */
export const getCurrentUser = async (): Promise<UserWithRelations> => {
  const id = await getMe();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      faculty: true,
      department: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
};

export const getCurrentUserOptional =
  async (): Promise<UserWithRelations | null> => {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        faculty: true,
        department: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError();
    }

    return user;
  };

/**
 * ユーザー名でユーザーを取得
 */
export const getUserByUsername = async (
  username: string,
): Promise<UserWithRelations> => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      faculty: true,
      department: true,
    },
  });

  if (!user) {
    throw new NotFoundError(`ユーザー名が"${username}"のユーザー`);
  }

  return user;
};

/**
 * ユーザー情報を取得
 */
export const getUser = async (id: string): Promise<UserWithRelations> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      faculty: true,
      department: true,
    },
  });

  if (!user) {
    throw new NotFoundError("ユーザー");
  }

  return user;
};

/**
 * 複数のユーザー情報を一括取得
 */
export const getUsers = async (
  userIds: string[],
): Promise<Map<string, UserWithRelations>> => {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: {
      faculty: true,
      department: true,
    },
  });

  return new Map(users.map(user => [user.id, user]));
};

/**
 * プロフィールを作成または更新
 */
export const updateUser = async (
  data: Partial<
    Pick<
      UserWithRelations,
      | "username"
      | "displayName"
      | "introduction"
      | "grade"
      | "image"
      | "facultyId"
      | "departmentId"
    >
  >,
): Promise<UserWithRelations> => {
  const userId = await getMe();

  // usernameの重複チェック
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: data.username,
        id: { not: userId },
      },
    });

    if (existing) {
      throw new ConflictError("このユーザー名は既に使用されています");
    }
  }

  // プロフィール完了状態の判定
  const isComplete = !!data.displayName;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      isProfileComplete: isComplete,
    },
    include: {
      faculty: true,
      department: true,
    },
  });

  // セッションを更新してisProfileCompleteを反映
  await unstable_update({
    user: {
      isProfileComplete: isComplete,
    },
  });

  return user;
};

/**
 * ユーザー名の利用可能性をチェック
 */
export const checkUsernameAvailability = async (
  username: string,
): Promise<boolean> => {
  const existing = await prisma.user.findUnique({
    where: { username },
  });
  return !existing;
};

/**
 * アカウントを削除
 */
export const deleteAccount = async (): Promise<void> => {
  const id = await getMe();

  if (id === "system") {
    throw new ConflictError("systemユーザーは削除できません");
  }

  await prisma.$transaction(async tx => {
    await tx.user.upsert({
      where: { id: "system" },
      update: {
        username: "__system__",
        displayName: "System",
        isProfileComplete: true,
        isAdmin: true,
      },
      create: {
        id: "system",
        username: "__system__",
        displayName: "System",
        isProfileComplete: true,
        isAdmin: true,
      },
    });

    await tx.lecture.updateMany({
      where: { ownerId: id },
      data: { ownerId: "system" },
    });

    await tx.user.delete({
      where: { id },
    });
  });
};

/**
 * 時間割公開設定を更新
 */
export const updateTimetableVisibility = async (
  isTimetablePublic: boolean,
): Promise<boolean> => {
  const userId = await getMe();

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isTimetablePublic },
    select: { isTimetablePublic: true },
  });

  return updated.isTimetablePublic;
};

/**
 * 全学部を取得
 */
export const getAllFaculties = async (): Promise<Faculty[]> => {
  return await prisma.faculty.findMany({
    orderBy: { name: "asc" },
  });
};

/**
 * 全学科を取得
 */
export const getAllDepartments = async (
  facultyId?: string,
): Promise<Department[]> => {
  return await prisma.department.findMany({
    where: facultyId ? { facultyId } : undefined,
    include: { faculty: true },
    orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
  });
};

/**
 * 学部に所属する学科を取得
 */
export const getDepartmentsByFaculty = async (
  facultyId: string,
): Promise<Department[]> => {
  return await prisma.department.findMany({
    where: { facultyId },
    orderBy: { name: "asc" },
  });
};

/**
 * usernameの利用可能性をチェック
 */
export const checkProfileIdAvailability = async (
  username: string,
): Promise<boolean> => {
  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return !existing;
};
