"use server";

import { getMe } from "@/features/user/actions";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { Task } from "@prisma/client";
import { normalizeTaskReminderOffsets } from "../constants";
import type { CreateTaskData, TaskStatusType, UpdateTaskData } from "../types";
import { TaskStatus } from "../types";

const getNextSortOrder = async (userId: string, status: TaskStatusType) => {
  const lastTask = await prisma.task.findFirst({
    where: { userId, status },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (lastTask?.sortOrder ?? 0) + 1;
};

const getTopSortOrder = async (userId: string, status: TaskStatusType) => {
  const firstTask = await prisma.task.findFirst({
    where: { userId, status },
    orderBy: { sortOrder: "asc" },
    select: { sortOrder: true },
  });

  return firstTask ? firstTask.sortOrder - 1 : 1;
};

export const getMyTasks = async (
  status?: TaskStatusType,
  registrationId?: string | null,
): Promise<Task[]> => {
  const userId = await getMe();

  return prisma.task.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(registrationId !== undefined &&
        registrationId !== null && { registrationId }),
    },
    orderBy: [
      { status: "asc" },
      { sortOrder: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
};

export const getTask = async (id: string): Promise<Task> => {
  const userId = await getMe();

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!task) {
    throw new NotFoundError("タスク");
  }

  return task;
};

export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const userId = await getMe();

  if (data.registrationId) {
    const registration = await prisma.registration.findFirst({
      where: {
        id: data.registrationId,
        userId,
      },
    });

    if (!registration) {
      throw new NotFoundError("指定された講義登録");
    }
  }

  const topSortOrder = await getTopSortOrder(userId, TaskStatus.INCOMPLETE);

  const createdTask = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      reminderOffsets: normalizeTaskReminderOffsets(data.reminderOffsets),
      status: TaskStatus.INCOMPLETE,
      sortOrder: topSortOrder,
      userId,
      registrationId: data.registrationId,
    },
  });

  return createdTask;
};

export const updateTask = async (
  id: string,
  data: UpdateTaskData,
): Promise<Task> => {
  const userId = await getMe();

  const existing = await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    throw new NotFoundError("タスク");
  }

  if (
    data.registrationId !== undefined &&
    data.registrationId !== null &&
    data.registrationId !== existing.registrationId
  ) {
    const registration = await prisma.registration.findFirst({
      where: {
        id: data.registrationId,
        userId,
      },
    });

    if (!registration) {
      throw new NotFoundError("指定された講義登録");
    }
  }

  let sortOrderToUpdate: number | undefined;
  if (data.status !== undefined && data.status !== existing.status) {
    sortOrderToUpdate = await getNextSortOrder(userId, data.status);
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.reminderOffsets !== undefined && {
        reminderOffsets: normalizeTaskReminderOffsets(data.reminderOffsets),
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(sortOrderToUpdate !== undefined && { sortOrder: sortOrderToUpdate }),
      ...(data.registrationId !== undefined && {
        registrationId: data.registrationId ?? null,
      }),
    },
  });
};

export const updateTaskStatus = async (
  id: string,
  status: TaskStatusType,
): Promise<Task> => {
  return updateTask(id, { status });
};

export const reorderTasks = async (
  status: TaskStatusType,
  orderedTaskIds: string[],
): Promise<void> => {
  const userId = await getMe();

  if (orderedTaskIds.length === 0) return;

  const existingTasks = await prisma.task.findMany({
    where: {
      userId,
      status,
      id: { in: orderedTaskIds },
    },
    select: { id: true },
  });

  if (existingTasks.length !== orderedTaskIds.length) {
    throw new NotFoundError("並び替え対象タスク");
  }

  await prisma.$transaction(
    orderedTaskIds.map((taskId, index) =>
      prisma.task.update({
        where: { id: taskId },
        data: { sortOrder: index + 1 },
      }),
    ),
  );
};

export const deleteTask = async (id: string): Promise<void> => {
  const userId = await getMe();

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    throw new NotFoundError("タスク");
  }

  await prisma.task.delete({
    where: { id },
  });
};

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
