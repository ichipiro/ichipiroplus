"use client";

import useActionFeedback from "@/hooks/useActionFeedback";
import type { Task } from "@prisma/client";
import { PlusIcon } from "@yamada-ui/lucide";
import {
  Box,
  Button,
  type SelectItem,
  VStack,
  useDisclosure,
} from "@yamada-ui/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  createTask as createTaskAction,
  deleteCompletedTasks as deleteCompletedTasksAction,
  deleteTask as deleteTaskAction,
  updateTask as updateTaskAction,
  updateTaskStatus as updateTaskStatusAction,
} from "../actions";
import {
  type TaskFormData,
  type TaskPriorityType,
  TaskStatus,
  type TaskStatusType,
} from "../types";
import CreateTaskForm from "./CreateTaskForm";
import DeleteCompletedTasksDialog from "./DeleteCompletedTasksDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";
import EditTaskModal from "./EditTaskModal";
import TaskColumn from "./TaskColumn";

interface TasksDashboardProps {
  initialTasks: Task[];
  lectureItems?: SelectItem[];
  registrationId?: string;
}

const TasksDashboard = ({
  initialTasks,
  lectureItems,
  registrationId,
}: TasksDashboardProps) => {
  const { open, onToggle } = useDisclosure();
  const { withFeedback } = useActionFeedback();

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, setIsPending] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modals, setModals] = useState({
    edit: false,
    delete: false,
    deleteCompleted: false,
  });

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const registrationLabels = useMemo(() => {
    if (!lectureItems) return {} as Record<string, ReactNode>;

    const map: Record<string, ReactNode> = {};

    const assignLabels = (items: SelectItem[]) => {
      for (const item of items) {
        if ("items" in item && Array.isArray(item.items)) {
          assignLabels(item.items);
          continue;
        }

        if ("value" in item && typeof item.value === "string") {
          map[item.value] = item.label;
        }
      }
    };

    assignLabels(lectureItems);

    return map;
  }, [lectureItems]);

  const runWithPending = async <T,>(action: () => Promise<T>): Promise<T> => {
    setIsPending(true);
    try {
      return await action();
    } finally {
      setIsPending(false);
    }
  };

  const todoTasks = useMemo(
    () => tasks.filter(task => task.status === TaskStatus.TODO),
    [tasks],
  );
  const inProgressTasks = useMemo(
    () => tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
    [tasks],
  );
  const completedTasks = useMemo(
    () => tasks.filter(task => task.status === TaskStatus.DONE),
    [tasks],
  );

  const handleCreateTask = async (
    data: Omit<TaskFormData, "status">,
  ): Promise<Task> =>
    runWithPending(async () => {
      const resolvedRegistrationId =
        data.registrationId === undefined
          ? registrationId
          : data.registrationId || undefined;
      const newTask = await createTaskAction({
        title: data.title,
        description: data.description,
        priority: data.priority as TaskPriorityType,
        dueDate: data.dueDate || undefined,
        registrationId: resolvedRegistrationId,
      });
      setTasks(prev => [...prev, newTask]);
      return newTask;
    });

  const handleUpdateTask = async (
    taskId: string,
    data: Partial<TaskFormData>,
  ): Promise<Task> =>
    runWithPending(async () => {
      const updatedTask = await updateTaskAction(taskId, {
        title: data.title,
        description: data.description,
        priority: data.priority as TaskPriorityType | undefined,
        status: data.status as TaskStatusType | undefined,
        dueDate: data.dueDate || undefined,
        registrationId:
          data.registrationId === undefined
            ? undefined
            : data.registrationId || undefined,
      });

      setTasks(prev =>
        prev.map(task => (task.id === taskId ? updatedTask : task)),
      );
      setSelectedTask(updatedTask);
      return updatedTask;
    });

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: TaskStatusType,
  ): Promise<Task> =>
    runWithPending(async () => {
      const updatedTask = await updateTaskStatusAction(taskId, status);
      setTasks(prev =>
        prev.map(task => (task.id === taskId ? updatedTask : task)),
      );
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
      return updatedTask;
    });

  const handleDeleteTask = async (taskId: string): Promise<void> =>
    runWithPending(async () => {
      await deleteTaskAction(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    });

  const handleDeleteCompletedTasks = async (): Promise<number> =>
    runWithPending(async () => {
      const deletedCount = await deleteCompletedTasksAction();
      setTasks(prev => prev.filter(task => task.status !== TaskStatus.DONE));
      return deletedCount;
    });

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setModals(prev => ({ ...prev, edit: true }));
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setModals(prev => ({ ...prev, delete: true }));
  };

  const openDeleteCompletedDialog = () => {
    setModals(prev => ({ ...prev, deleteCompleted: true }));
  };

  const closeModal = (modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  return (
    <Box w="full">
      <Box w="full">
        <Button
          leftIcon={<PlusIcon />}
          onClick={onToggle}
          colorScheme="blue"
          size="sm"
          mb={4}
        >
          {open ? "キャンセル" : "タスクを追加"}
        </Button>

        {open && (
          <CreateTaskForm
            lectureItems={lectureItems}
            defaultRegistrationId={registrationId}
            onCreate={handleCreateTask}
            onSuccess={() => onToggle()}
            isPending={isPending}
          />
        )}
      </Box>

      <VStack>
        <TaskColumn
          title="未着手"
          tasks={todoTasks}
          isPending={isPending}
          onUpdateStatus={handleUpdateTaskStatus}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          registrationLabels={registrationLabels}
        />
        <TaskColumn
          title="進行中"
          tasks={inProgressTasks}
          isPending={isPending}
          onUpdateStatus={handleUpdateTaskStatus}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          registrationLabels={registrationLabels}
        />
        <TaskColumn
          title="完了"
          tasks={completedTasks}
          isPending={isPending}
          onUpdateStatus={handleUpdateTaskStatus}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          registrationLabels={registrationLabels}
          extraHeader={
            completedTasks.length > 0 && (
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={openDeleteCompletedDialog}
                isDisabled={isPending}
              >
                完了タスクをすべて削除
              </Button>
            )
          }
        />
      </VStack>

      <EditTaskModal
        isOpen={modals.edit}
        onClose={() => closeModal("edit")}
        task={selectedTask}
        lectureItems={lectureItems}
        onSuccess={() => closeModal("edit")}
        onUpdate={handleUpdateTask}
        isPending={isPending}
      />

      {selectedTask && (
        <DeleteTaskDialog
          isOpen={modals.delete}
          onClose={() => closeModal("delete")}
          onDelete={async () => {
            if (!selectedTask) return false;

            await withFeedback(handleDeleteTask(selectedTask.id), {
              successMessage: "タスクを削除しました",
              successTitle: "タスク削除",
            });

            closeModal("delete");
            return true;
          }}
        />
      )}

      <DeleteCompletedTasksDialog
        isOpen={modals.deleteCompleted}
        onClose={() => closeModal("deleteCompleted")}
        onDelete={async () => {
          const count = await withFeedback(handleDeleteCompletedTasks(), {
            successMessage: count => `${count}件の完了タスクを削除しました`,
            successTitle: "一括削除",
          });
          if (count !== undefined) {
            closeModal("deleteCompleted");
          }
          return true;
        }}
        taskCount={completedTasks.length}
      />
    </Box>
  );
};

export default TasksDashboard;
