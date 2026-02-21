"use client";

import useActionFeedback from "@/hooks/useActionFeedback";
import type { Task } from "@prisma/client";
import { CircleCheckBigIcon, CircleIcon, Trash2Icon } from "@yamada-ui/lucide";
import {
  Box,
  HStack,
  IconButton,
  Input,
  type SelectItem,
  Text,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import TaskMetaRow from "./task-item/TaskMetaRow";
import TaskReminderSection from "./task-item/TaskReminderSection";
import { useTaskItemDraft } from "./task-item/useTaskItemDraft";

interface TaskItemProps {
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
      reminderOffsets?: number[];
      registrationId?: string | null;
    },
  ) => Promise<Task>;
  onToggleCompleted: (taskId: string) => Promise<Task | null>;
  onDelete: (taskId: string) => Promise<void>;
}

const CLICK_INSIDE_OVERLAY_SELECTOR = [
  '[role="listbox"]',
  '[role="option"]',
  '[role="combobox"]',
  ".ui-select",
  ".ui-multi-select",
  ".ui-datepicker",
  ".ui-popover",
].join(",");

const TaskItem = ({
  task,
  isPending,
  lectureItems,
  registrationLabel,
  autoEdit = false,
  onAutoEditConsumed,
  onUpdate,
  onToggleCompleted,
  onDelete,
}: TaskItemProps) => {
  const { withFeedback } = useActionFeedback();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    title,
    description,
    registrationId,
    dueDate,
    dueTime,
    reminderOffsets,
    formattedDueDate,
    hasChanges,
    orderedReminderOffsets,
    setTitle,
    setDescription,
    setRegistrationId,
    setDueDateByPicker,
    setDueHour,
    setDueMinute,
    toggleReminderOffset,
  } = useTaskItemDraft(task);

  useEffect(() => {
    if (!autoEdit) return;
    setIsEditing(true);
    onAutoEditConsumed?.();
  }, [autoEdit, onAutoEditConsumed]);

  const isCompleted = task.status === 2;

  const handleToggleCompleted = async (event: MouseEvent) => {
    event.stopPropagation();
    if (isPending) return;

    await withFeedback(onToggleCompleted(task.id), {
      successMessage: isCompleted ? "未完了に戻しました" : "完了にしました",
      successTitle: "タスク更新",
    });
  };

  const saveIfChanged = useCallback(async () => {
    if (!isEditing || isPending) return;

    const normalizedTitle = title.trim() || task.title;

    if (!hasChanges && normalizedTitle === task.title) {
      setIsEditing(false);
      return;
    }

    const result = await withFeedback(
      (() => {
        const resolvedRegistrationId =
          registrationId === undefined && task.registrationId
            ? null
            : registrationId;

        return onUpdate(task.id, {
          title: normalizedTitle,
          description,
          dueDate,
          reminderOffsets,
          registrationId: resolvedRegistrationId,
        });
      })(),
      {
        errorTitle: "タスク更新",
      },
    );

    if (result) {
      setIsEditing(false);
    }
  }, [
    description,
    dueDate,
    hasChanges,
    isEditing,
    isPending,
    onUpdate,
    registrationId,
    reminderOffsets,
    task.id,
    task.registrationId,
    task.title,
    title,
    withFeedback,
  ]);

  const handleDelete = async () => {
    if (isPending) return;

    await withFeedback(onDelete(task.id), {
      successMessage: "タスクを削除しました",
      successTitle: "タスク削除",
    });
  };

  const enterEditMode = () => {
    if (isPending || isEditing) return;
    setIsEditing(true);
  };

  useEffect(() => {
    if (!isEditing) return;

    const handleDocumentClick = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      const element = target instanceof Element ? target : target.parentElement;
      if (element?.closest(CLICK_INSIDE_OVERLAY_SELECTOR)) return;

      if (rootRef.current?.contains(target)) return;
      void saveIfChanged();
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isEditing, saveIfChanged]);

  return (
    <Box
      ref={rootRef}
      position="relative"
      borderWidth="1px"
      borderRadius="md"
      bg={["white", "black"]}
      opacity={isCompleted ? 0.75 : 1}
      p={3}
      pr={11}
      cursor={isEditing ? "default" : "pointer"}
      overflow="visible"
      onClick={enterEditMode}
    >
      <IconButton
        aria-label="タスクを削除"
        icon={<Trash2Icon size="sm" />}
        size="xs"
        colorScheme="red"
        variant="ghost"
        position="absolute"
        top={2}
        right={2}
        onClick={event => {
          event.stopPropagation();
          void handleDelete();
        }}
        disabled={isPending}
      />

      <HStack align="start" gap={3} minW={0}>
        <IconButton
          aria-label={isCompleted ? "未完了に戻す" : "完了にする"}
          icon={isCompleted ? <CircleCheckBigIcon /> : <CircleIcon />}
          variant="ghost"
          colorScheme={isCompleted ? "green" : "gray"}
          size="sm"
          onClick={handleToggleCompleted}
          loading={isPending}
          mt={0.5}
          flexShrink={0}
        />

        <VStack align="stretch" flex={1} minW={0} gap={2}>
          {isEditing ? (
            <Input
              value={title}
              onChange={event => setTitle(event.target.value)}
              fontWeight="medium"
              size="sm"
              onClick={event => event.stopPropagation()}
            />
          ) : (
            <Text
              fontWeight="medium"
              fontSize="md"
              textDecoration={isCompleted ? "line-through" : "none"}
              color={isCompleted ? "gray.500" : "inherit"}
              lineClamp={2}
              wordBreak="break-word"
            >
              {task.title}
            </Text>
          )}

          {isEditing ? (
            <Textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="詳細を入力"
              rows={2}
              size="sm"
              onClick={event => event.stopPropagation()}
            />
          ) : (
            <Text
              fontSize="sm"
              color={isCompleted ? "gray.400" : "gray.600"}
              minH={description ? undefined : "1.25rem"}
              lineClamp={2}
              wordBreak="break-word"
            >
              {description || "詳細なし"}
            </Text>
          )}

          <TaskMetaRow
            isEditing={isEditing}
            dueDate={dueDate}
            dueTime={dueTime}
            formattedDueDate={formattedDueDate}
            lectureItems={lectureItems}
            registrationId={registrationId}
            registrationLabel={registrationLabel}
            onDueDateChange={setDueDateByPicker}
            onDueHourChange={setDueHour}
            onDueMinuteChange={setDueMinute}
            onRegistrationChange={setRegistrationId}
          />

          <TaskReminderSection
            isEditing={isEditing}
            reminderOffsets={reminderOffsets}
            orderedReminderOffsets={orderedReminderOffsets}
            onToggleOffset={toggleReminderOffset}
          />

          <HStack justify="flex-end" pt={1} />
        </VStack>
      </HStack>
    </Box>
  );
};

export default TaskItem;
