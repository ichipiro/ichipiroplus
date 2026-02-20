"use client";

import useActionFeedback from "@/hooks/useActionFeedback";
import { format } from "@formkit/tempo";
import type { Task } from "@prisma/client";
import { DatePicker } from "@yamada-ui/calendar";
import {
  CalendarIcon,
  CircleCheckBigIcon,
  CircleIcon,
  Trash2Icon,
} from "@yamada-ui/lucide";
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Input,
  Select,
  type SelectItem,
  Text,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
      registrationId?: string;
    },
  ) => Promise<Task>;
  onToggleCompleted: (taskId: string) => Promise<Task | null>;
  onDelete: (taskId: string) => Promise<void>;
}

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
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [registrationId, setRegistrationId] = useState<string | undefined>(
    task.registrationId ?? undefined,
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined,
  );

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setRegistrationId(task.registrationId ?? undefined);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setIsEditing(false);
  }, [task]);

  useEffect(() => {
    if (!autoEdit) return;
    setIsEditing(true);
    onAutoEditConsumed?.();
  }, [autoEdit, onAutoEditConsumed]);

  const isCompleted = task.status === 2;

  const formattedDueDate = useMemo(
    () => (dueDate ? format(dueDate, "short", "ja") : null),
    [dueDate],
  );

  const hasChanges = useMemo(() => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description;
    const originalDueTime = task.dueDate
      ? new Date(task.dueDate).getTime()
      : null;
    const currentDueTime = dueDate ? dueDate.getTime() : null;

    return (
      normalizedTitle !== task.title ||
      normalizedDescription !== (task.description ?? "") ||
      registrationId !== (task.registrationId ?? undefined) ||
      originalDueTime !== currentDueTime
    );
  }, [description, dueDate, registrationId, task, title]);

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
      onUpdate(task.id, {
        title: normalizedTitle,
        description,
        dueDate,
        registrationId,
      }),
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
    task.id,
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
      if (rootRef.current?.contains(target)) return;
      void saveIfChanged();
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
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

          <HStack gap={2} flexWrap={isEditing ? "wrap" : "nowrap"} minW={0}>
            {isEditing ? (
              <DatePicker
                value={dueDate}
                onChange={value => setDueDate(value || undefined)}
                placeholder="期限を設定"
                size="sm"
                maxW={{ base: "full", sm: "xs" }}
                onClick={event => event.stopPropagation()}
              />
            ) : (
              <HStack
                as="span"
                borderWidth="1px"
                borderRadius="full"
                px={2}
                py={1}
                minW={0}
                maxW="full"
                color={["gray.700", "gray.100"]}
                borderColor={["gray.300", "gray.500"]}
                bg={["gray.100", "gray.700"]}
                gap={1}
              >
                <CalendarIcon size="sm" />
                <Text fontSize="xs" lineClamp={1}>
                  {formattedDueDate ?? "未設定"}
                </Text>
              </HStack>
            )}

            {isEditing && lectureItems ? (
              <Select
                items={lectureItems}
                value={registrationId}
                onChange={value => setRegistrationId(value || undefined)}
                placeholder="講義を選択"
                size="sm"
                maxW={{ base: "full", sm: "xs" }}
                onClick={event => event.stopPropagation()}
              />
            ) : (
              <Badge
                colorScheme="purple"
                variant="subtle"
                alignSelf="flex-start"
                borderRadius="full"
                px={2}
                py={1}
                minW={0}
                maxW={isEditing ? "full" : "70%"}
              >
                <Text
                  fontSize="xs"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {registrationLabel ?? "講義未設定"}
                </Text>
              </Badge>
            )}
          </HStack>

          <HStack justify="flex-end" pt={1} />
        </VStack>
      </HStack>
    </Box>
  );
};

export default TaskItem;
