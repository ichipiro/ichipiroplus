"use client";

import useActionFeedback from "@/hooks/useActionFeedback";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@prisma/client";
import { PlusIcon } from "@yamada-ui/lucide";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  type SelectItem,
  Text,
  VStack,
} from "@yamada-ui/react";
import { useMemo, useState } from "react";
import { useTaskBoard } from "../hooks/useTaskBoard";
import { type TaskStatusType, TaskStatus } from "../types";
import TaskItem from "./TaskItem";

interface TasksDashboardProps {
  initialTasks: Task[];
  lectureItems?: SelectItem[];
  registrationId?: string;
  fixedRegistrationLabel?: string;
}

type SortableTaskItemProps = {
  task: Task;
  isPending: boolean;
  lectureItems?: SelectItem[];
  registrationLabel?: string;
  autoEdit?: boolean;
  onAutoEditConsumed?: () => void;
  onUpdate: (
    taskId: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: Date;
      registrationId?: string;
    },
  ) => Promise<Task>;
  onToggleCompleted: (taskId: string) => Promise<Task | null>;
  onDelete: (taskId: string) => Promise<void>;
};

const SortableTaskItem = ({ task, ...props }: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });

  return (
    <Box
      ref={setNodeRef}
      transform={CSS.Transform.toString(transform)}
      transition={transition}
      opacity={isDragging ? 0.5 : 1}
      touchAction="none"
      {...attributes}
      {...listeners}
    >
      <TaskItem task={task} {...props} />
    </Box>
  );
};

const TasksDashboard = ({
  initialTasks,
  lectureItems,
  registrationId,
  fixedRegistrationLabel,
}: TasksDashboardProps) => {
  const { withFeedback } = useActionFeedback();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [autoEditTaskId, setAutoEditTaskId] = useState<string | null>(null);

  const {
    isPending,
    incompleteTasks,
    completedTasks,
    completedTasksCount,
    handleCreateTask,
    handleUpdateTask,
    handleToggleTaskCompletion,
    handleReorderTasks,
    handleDeleteTask,
    handleDeleteCompletedTasks,
  } = useTaskBoard({
    initialTasks,
    registrationId,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const registrationLabels = useMemo(() => {
    if (!lectureItems) return {} as Record<string, string>;

    const map: Record<string, string> = {};

    const assignLabels = (items: SelectItem[]) => {
      for (const item of items) {
        if ("items" in item && Array.isArray(item.items)) {
          assignLabels(item.items);
          continue;
        }

        if ("value" in item && typeof item.value === "string") {
          if (typeof item.label === "string") {
            map[item.value] = item.label;
          } else if (typeof item.label === "number") {
            map[item.value] = String(item.label);
          }
        }
      }
    };

    assignLabels(lectureItems);

    return map;
  }, [lectureItems]);

  const getRegistrationLabel = (task: Task) => {
    if (!task.registrationId) return undefined;

    if (fixedRegistrationLabel && registrationId === task.registrationId) {
      return fixedRegistrationLabel;
    }

    return registrationLabels[task.registrationId] ?? "講義";
  };

  const allTasks = useMemo(
    () => [...incompleteTasks, ...completedTasks],
    [incompleteTasks, completedTasks],
  );

  const activeTask = useMemo(
    () => allTasks.find(task => task.id === activeTaskId) ?? null,
    [allTasks, activeTaskId],
  );

  const handleQuickCreate = async () => {
    if (isPending) return;

    const created = await withFeedback(
      handleCreateTask({
        title: "新しいタスク",
        description: "",
        dueDate: undefined,
        registrationId,
      }),
      {
        successMessage: "新しいタスクを追加しました",
        successTitle: "タスク追加",
      },
    );

    if (created) {
      setAutoEditTaskId(created.id);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTaskId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTask = allTasks.find(task => task.id === activeId);
    const overTask = allTasks.find(task => task.id === overId);

    if (!activeTask || !overTask || activeTask.status !== overTask.status) {
      return;
    }

    const status = activeTask.status as TaskStatusType;
    const currentTasks =
      status === TaskStatus.INCOMPLETE ? incompleteTasks : completedTasks;

    const oldIndex = currentTasks.findIndex(task => task.id === activeId);
    const newIndex = currentTasks.findIndex(task => task.id === overId);

    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const orderedTasks = arrayMove(currentTasks, oldIndex, newIndex);
    const orderedTaskIds = orderedTasks.map(task => task.id);

    await handleReorderTasks(status, orderedTaskIds);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box w="full">
        <Box w="full" mb={4}>
          <Button
            leftIcon={<PlusIcon />}
            onClick={handleQuickCreate}
            colorScheme="blue"
            size="sm"
            disabled={isPending}
          >
            タスクを追加
          </Button>
        </Box>

        <VStack align="stretch" gap={4}>
          <Box>
            {incompleteTasks.length === 0 ? (
              <Box
                py={8}
                textAlign="center"
                borderWidth="1px"
                borderRadius="md"
              >
                <Text color="gray.500">未完了のタスクはありません</Text>
              </Box>
            ) : (
              <SortableContext
                items={incompleteTasks.map(task => task.id)}
                strategy={rectSortingStrategy}
              >
                <VStack align="stretch" gap={3}>
                  {incompleteTasks.map(task => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      isPending={isPending}
                      lectureItems={lectureItems}
                      autoEdit={autoEditTaskId === task.id}
                      onAutoEditConsumed={() => setAutoEditTaskId(null)}
                      onUpdate={handleUpdateTask}
                      onToggleCompleted={handleToggleTaskCompletion}
                      onDelete={handleDeleteTask}
                      registrationLabel={getRegistrationLabel(task)}
                    />
                  ))}
                </VStack>
              </SortableContext>
            )}
          </Box>

          <Accordion toggle variant="unstyled" w="full">
            <AccordionItem
              label={
                <Text fontWeight="bold">完了済み ({completedTasksCount})</Text>
              }
            >
              <AccordionPanel px={0}>
                {completedTasksCount > 0 && (
                  <HStack justify="flex-end" mb={2}>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="outline"
                      onClick={async () => {
                        await withFeedback(handleDeleteCompletedTasks(), {
                          successMessage: count =>
                            `${count}件の完了タスクを削除しました`,
                          successTitle: "一括削除",
                        });
                      }}
                      disabled={isPending}
                    >
                      すべて削除
                    </Button>
                  </HStack>
                )}

                {completedTasks.length === 0 ? (
                  <Box
                    py={4}
                    textAlign="center"
                    borderWidth="1px"
                    borderRadius="md"
                  >
                    <Text color="gray.500">完了済みタスクはありません</Text>
                  </Box>
                ) : (
                  <SortableContext
                    items={completedTasks.map(task => task.id)}
                    strategy={rectSortingStrategy}
                  >
                    <VStack align="stretch" gap={3}>
                      {completedTasks.map(task => (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          isPending={isPending}
                          lectureItems={lectureItems}
                          autoEdit={autoEditTaskId === task.id}
                          onAutoEditConsumed={() => setAutoEditTaskId(null)}
                          onUpdate={handleUpdateTask}
                          onToggleCompleted={handleToggleTaskCompletion}
                          onDelete={handleDeleteTask}
                          registrationLabel={getRegistrationLabel(task)}
                        />
                      ))}
                    </VStack>
                  </SortableContext>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </Box>

      <DragOverlay>
        {activeTask ? (
          <Box maxW="full" w="full" opacity={0.95}>
            <TaskItem
              task={activeTask}
              isPending
              lectureItems={lectureItems}
              onUpdate={handleUpdateTask}
              onToggleCompleted={handleToggleTaskCompletion}
              onDelete={handleDeleteTask}
              registrationLabel={getRegistrationLabel(activeTask)}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TasksDashboard;
