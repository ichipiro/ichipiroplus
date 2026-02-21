"use client";

import type { Task } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTask as createTaskAction,
  deleteCompletedTasks as deleteCompletedTasksAction,
  deleteTask as deleteTaskAction,
  reorderTasks as reorderTasksAction,
  updateTask as updateTaskAction,
  updateTaskStatus as updateTaskStatusAction,
} from "../actions";
import { type TaskFormData, type TaskStatusType, TaskStatus } from "../types";

interface UseTaskBoardProps {
  initialTasks: Task[];
  registrationId?: string;
}

const sortByOrder = (tasks: Task[]) =>
  [...tasks].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

export const useTaskBoard = ({
  initialTasks,
  registrationId,
}: UseTaskBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const runWithPending = useCallback(async <T>(action: () => Promise<T>) => {
    setIsPending(true);
    try {
      return await action();
    } finally {
      setIsPending(false);
    }
  }, []);

  const incompleteTasks = useMemo(
    () =>
      sortByOrder(tasks.filter(task => task.status === TaskStatus.INCOMPLETE)),
    [tasks],
  );

  const completedTasks = useMemo(
    () => sortByOrder(tasks.filter(task => task.status === TaskStatus.DONE)),
    [tasks],
  );

  const handleCreateTask = useCallback(
    async (data: Omit<TaskFormData, "status">): Promise<Task> =>
      runWithPending(async () => {
        const resolvedRegistrationId =
          data.registrationId === undefined
            ? registrationId
            : (data.registrationId ?? undefined);

        const newTask = await createTaskAction({
          title: data.title,
          description: data.description,
          dueDate: data.dueDate || undefined,
          registrationId: resolvedRegistrationId,
          reminderOffsets: data.reminderOffsets,
        });

        setTasks(prev => [...prev, newTask]);
        return newTask;
      }),
    [registrationId, runWithPending],
  );

  const handleUpdateTask = useCallback(
    async (taskId: string, data: Partial<TaskFormData>): Promise<Task> =>
      runWithPending(async () => {
        const updatedTask = await updateTaskAction(taskId, {
          title: data.title,
          description: data.description,
          status: data.status as TaskStatusType | undefined,
          dueDate: data.dueDate || undefined,
          reminderOffsets: data.reminderOffsets,
          registrationId:
            data.registrationId === undefined ? undefined : data.registrationId,
        });

        setTasks(prev =>
          prev.map(task => (task.id === taskId ? updatedTask : task)),
        );

        return updatedTask;
      }),
    [runWithPending],
  );

  const handleToggleTaskCompletion = useCallback(
    async (taskId: string): Promise<Task | null> => {
      const target = tasks.find(task => task.id === taskId);
      if (!target) return null;

      const nextStatus =
        target.status === TaskStatus.DONE
          ? TaskStatus.INCOMPLETE
          : TaskStatus.DONE;

      return runWithPending(async () => {
        const updatedTask = await updateTaskStatusAction(taskId, nextStatus);
        setTasks(prev =>
          prev.map(task => (task.id === taskId ? updatedTask : task)),
        );
        return updatedTask;
      });
    },
    [runWithPending, tasks],
  );

  const handleReorderTasks = useCallback(
    async (status: TaskStatusType, orderedTaskIds: string[]): Promise<void> => {
      if (orderedTaskIds.length === 0) return;

      const previousTasks = tasks;
      const orderMap = new Map(
        orderedTaskIds.map((id, index) => [id, index + 1]),
      );

      setTasks(prev =>
        prev.map(task => {
          if (task.status !== status) return task;
          const nextOrder = orderMap.get(task.id);
          return nextOrder ? { ...task, sortOrder: nextOrder } : task;
        }),
      );

      try {
        await runWithPending(() => reorderTasksAction(status, orderedTaskIds));
      } catch (error) {
        setTasks(previousTasks);
        throw error;
      }
    },
    [runWithPending, tasks],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string): Promise<void> =>
      runWithPending(async () => {
        await deleteTaskAction(taskId);
        setTasks(prev => prev.filter(task => task.id !== taskId));
      }),
    [runWithPending],
  );

  const handleDeleteCompletedTasks = useCallback(
    async (): Promise<number> =>
      runWithPending(async () => {
        const deletedCount = await deleteCompletedTasksAction();
        setTasks(prev => prev.filter(task => task.status !== TaskStatus.DONE));
        return deletedCount;
      }),
    [runWithPending],
  );

  return {
    isPending,
    incompleteTasks,
    completedTasks,
    completedTasksCount: completedTasks.length,
    handleCreateTask,
    handleUpdateTask,
    handleToggleTaskCompletion,
    handleReorderTasks,
    handleDeleteTask,
    handleDeleteCompletedTasks,
  };
};
