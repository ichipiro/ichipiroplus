import { create } from "zustand";
import * as actions from "../actions";
import type {
  TaskFormData,
  TaskPriorityType,
  TaskStatusType,
  TaskWithRelations,
} from "../types";
import { TaskStatus } from "../types";

type UIModals = {
  edit: boolean;
  delete: boolean;
  deleteCompleted: boolean;
};

interface TaskStore {
  // データ
  tasks: TaskWithRelations[];
  isPending: boolean;

  // UI状態
  selectedTask: TaskWithRelations | null;
  modals: UIModals;

  // 計算プロパティ（セレクター関数で実装）
  todoTasks: TaskWithRelations[];
  inProgressTasks: TaskWithRelations[];
  completedTasks: TaskWithRelations[];

  // データ操作（通知付き版を別途作成）
  loadTasks: (tasks: TaskWithRelations[]) => void;
  createTask: (
    data: Omit<TaskFormData, "status">,
  ) => Promise<TaskWithRelations>;
  updateTask: (
    taskId: string,
    data: Partial<TaskFormData>,
  ) => Promise<TaskWithRelations>;
  updateTaskStatus: (
    taskId: string,
    status: TaskStatusType,
  ) => Promise<TaskWithRelations>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteCompletedTasks: () => Promise<number>;

  // UI操作
  openEditModal: (task: TaskWithRelations) => void;
  openDeleteDialog: (task: TaskWithRelations) => void;
  openDeleteCompletedDialog: () => void;
  closeModal: (modal: keyof UIModals) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // 初期状態
  tasks: [],
  isPending: false,
  selectedTask: null,
  modals: {
    edit: false,
    delete: false,
    deleteCompleted: false,
  },

  // 計算プロパティ（通常のプロパティとして実装）
  todoTasks: [],
  inProgressTasks: [],
  completedTasks: [],

  // データ操作
  loadTasks: tasks => {
    const todoTasks = tasks.filter(task => task.status === TaskStatus.TODO);
    const inProgressTasks = tasks.filter(
      task => task.status === TaskStatus.IN_PROGRESS,
    );
    const completedTasks = tasks.filter(
      task => task.status === TaskStatus.DONE,
    );

    set({ tasks, todoTasks, inProgressTasks, completedTasks });
  },

  createTask: async data => {
    set({ isPending: true });
    try {
      const newTask = await actions.createTask({
        title: data.title,
        description: data.description || "",
        priority: data.priority as TaskPriorityType,
        dueDate: data.dueDate || undefined,
        registrationId: data.registrationId || undefined,
      });

      const updatedTasks = [...get().tasks, newTask];
      const todoTasks = updatedTasks.filter(
        task => task.status === TaskStatus.TODO,
      );
      const inProgressTasks = updatedTasks.filter(
        task => task.status === TaskStatus.IN_PROGRESS,
      );
      const completedTasks = updatedTasks.filter(
        task => task.status === TaskStatus.DONE,
      );

      set({
        tasks: updatedTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        isPending: false,
      });

      return newTask;
    } catch (error) {
      set({ isPending: false });
      throw error;
    }
  },

  updateTask: async (taskId, data) => {
    set({ isPending: true });
    try {
      const updatedTask = await actions.updateTask(taskId, {
        title: data.title,
        description: data.description,
        priority: data.priority as TaskPriorityType,
        status: data.status as TaskStatusType,
        dueDate: data.dueDate || undefined,
        registrationId: data.registrationId || undefined,
      });

      const updatedTasks = get().tasks.map(task =>
        task.id === taskId ? updatedTask : task,
      );
      const todoTasks = updatedTasks.filter(
        task => task.status === TaskStatus.TODO,
      );
      const inProgressTasks = updatedTasks.filter(
        task => task.status === TaskStatus.IN_PROGRESS,
      );
      const completedTasks = updatedTasks.filter(
        task => task.status === TaskStatus.DONE,
      );

      set({
        tasks: updatedTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        isPending: false,
      });

      return updatedTask;
    } catch (error) {
      set({ isPending: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    set({ isPending: true });
    try {
      const updatedTask = await actions.updateTaskStatus(taskId, status);

      const updatedTasks = get().tasks.map(task =>
        task.id === taskId ? updatedTask : task,
      );
      const todoTasks = updatedTasks.filter(
        task => task.status === TaskStatus.TODO,
      );
      const inProgressTasks = updatedTasks.filter(
        task => task.status === TaskStatus.IN_PROGRESS,
      );
      const completedTasks = updatedTasks.filter(
        task => task.status === TaskStatus.DONE,
      );

      set({
        tasks: updatedTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        isPending: false,
      });

      return updatedTask;
    } catch (error) {
      set({ isPending: false });
      throw error;
    }
  },

  deleteTask: async taskId => {
    set({ isPending: true });
    try {
      await actions.deleteTask(taskId);

      const updatedTasks = get().tasks.filter(task => task.id !== taskId);
      const todoTasks = updatedTasks.filter(
        task => task.status === TaskStatus.TODO,
      );
      const inProgressTasks = updatedTasks.filter(
        task => task.status === TaskStatus.IN_PROGRESS,
      );
      const completedTasks = updatedTasks.filter(
        task => task.status === TaskStatus.DONE,
      );

      set({
        tasks: updatedTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        isPending: false,
      });
    } catch (error) {
      set({ isPending: false });
      throw error;
    }
  },

  deleteCompletedTasks: async () => {
    set({ isPending: true });
    try {
      const deletedCount = await actions.deleteCompletedTasks();

      const updatedTasks = get().tasks.filter(
        task => task.status !== TaskStatus.DONE,
      );
      const todoTasks = updatedTasks.filter(
        task => task.status === TaskStatus.TODO,
      );
      const inProgressTasks = updatedTasks.filter(
        task => task.status === TaskStatus.IN_PROGRESS,
      );

      set({
        tasks: updatedTasks,
        todoTasks,
        inProgressTasks,
        completedTasks: [],
        isPending: false,
      });

      return deletedCount;
    } catch (error) {
      set({ isPending: false });
      throw error;
    }
  },

  // UI操作
  openEditModal: task =>
    set({
      selectedTask: task,
      modals: { ...get().modals, edit: true },
    }),

  openDeleteDialog: task =>
    set({
      selectedTask: task,
      modals: { ...get().modals, delete: true },
    }),

  openDeleteCompletedDialog: () =>
    set(state => ({
      modals: { ...state.modals, deleteCompleted: true },
    })),

  closeModal: modal =>
    set(state => ({
      modals: { ...state.modals, [modal]: false },
    })),
}));
