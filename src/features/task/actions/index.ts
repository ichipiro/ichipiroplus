"use server";

import { getMe } from "@/features/user/actions";
import { prisma } from "@/lib/prisma";
import type { Task } from "@prisma/client";
import type { CreateTaskData, TaskStatusType, UpdateTaskData } from "../types";
import { TaskPriority, TaskStatus } from "../types";

/**
 * 自分のタスク一覧を取得
 */
export const getMyTasks = async (
  status?: TaskStatusType,
  registrationId?: string,
): Promise<Task[]> => {
  const userId = await getMe();

  return await prisma.task.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(registrationId && { registrationId }),
    },
    orderBy: [
      { status: "asc" },
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
};

/**
 * タスク詳細を取得
 */
export const getTask = async (id: string): Promise<Task> => {
  const userId = await getMe();

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!task) {
    throw new Error("タスクが見つかりません");
  }

  return task;
};

/**
 * タスクを作成
 */
export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const userId = await getMe();

  // registrationIdが指定された場合、所有者チェック
  if (data.registrationId) {
    const registration = await prisma.registration.findFirst({
      where: {
        id: data.registrationId,
        userId,
      },
    });

    if (!registration) {
      throw new Error("指定された講義登録が見つかりません");
    }
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority || TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      userId,
      registrationId: data.registrationId,
    },
  });

  return task;
};

/**
 * タスクを更新
 */
export const updateTask = async (
  id: string,
  data: UpdateTaskData,
): Promise<Task> => {
  const userId = await getMe();

  // 所有者チェック
  const existing = await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    throw new Error("タスクが見つかりません");
  }

  // registrationIdが変更される場合、新しい登録の所有者チェック
  if (data.registrationId && data.registrationId !== existing.registrationId) {
    const registration = await prisma.registration.findFirst({
      where: {
        id: data.registrationId,
        userId,
      },
    });

    if (!registration) {
      throw new Error("指定された講義登録が見つかりません");
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.registrationId !== undefined && {
        registrationId: data.registrationId,
      }),
    },
  });

  return task;
};

/**
 * タスクのステータスを更新（簡易版）
 */
export const updateTaskStatus = async (
  id: string,
  status: TaskStatusType,
): Promise<Task> => {
  return updateTask(id, { status });
};

/**
 * タスクを削除
 */
export const deleteTask = async (id: string): Promise<void> => {
  const userId = await getMe();

  // 削除前に関連情報を取得
  const task = await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      registrationId: true,
    },
  });

  if (!task) {
    throw new Error("タスクが見つかりません");
  }

  await prisma.task.delete({
    where: { id },
  });
};

/**
 * 完了済みタスクを一括削除
 */
export const deleteCompletedTasks = async (): Promise<number> => {
  const userId = await getMe();

  const result = await prisma.task.deleteMany({
    where: {
      userId,
      status: TaskStatus.DONE,
    },
  });

  return result.count;
};
