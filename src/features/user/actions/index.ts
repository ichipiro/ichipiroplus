"use server";

import { auth, unstable_update } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Department, Faculty } from "@prisma/client";
import type { UserWithRelations } from "../types";

export const getMe = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
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
    throw new Error("Unauthorized");
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
      throw new Error("Unauthorized");
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
    throw new Error(`ユーザー名が"${username}"のユーザーが見つかりません`);
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
    throw new Error("ユーザーが見つかりません");
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
      throw new Error("このユーザー名は既に使用されています");
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

  await prisma.user.delete({
    where: { id },
  });
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
