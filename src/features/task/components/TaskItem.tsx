"use client";

import {
  TaskPriority,
  TaskStatus,
  type TaskStatusType,
} from "@/features/task/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import { format } from "@formkit/tempo";
import type { Task } from "@prisma/client";
import {
  CircleCheckBigIcon,
  CircleIcon,
  EllipsisIcon,
} from "@yamada-ui/lucide";
import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Tooltip,
  VStack,
} from "@yamada-ui/react";
import type { ReactNode } from "react";

interface TaskItemProps {
  task: Task;
  showLecture?: boolean;
  isPending: boolean;
  onUpdateStatus: (taskId: string, status: TaskStatusType) => Promise<Task>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  registrationLabel?: ReactNode;
}

const TaskItem = ({
  task,
  showLecture = true,
  isPending,
  onUpdateStatus,
  onEdit,
  onDelete,
  registrationLabel,
}: TaskItemProps) => {
  const { withFeedback } = useActionFeedback();

  const handleToggleStatus = async () => {
    if (isPending) return;
    const newStatus =
      task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    await withFeedback(onUpdateStatus(task.id, newStatus), {
      successMessage: "タスクのステータスを更新しました",
      successTitle: "ステータス更新",
    });
  };

  const handleUpdateToStatus = async (status: TaskStatusType) => {
    if (isPending || task.status === status) return;
    await withFeedback(onUpdateStatus(task.id, status), {
      successMessage: "タスクのステータスを更新しました",
      successTitle: "ステータス更新",
    });
  };

  const priorityColor =
    {
      [TaskPriority.LOW]: "green",
      [TaskPriority.MEDIUM]: "blue",
      [TaskPriority.HIGH]: "red",
    }[task.priority] || "gray";

  const isCompleted = task.status === TaskStatus.DONE;
  const formattedDueDate = task.dueDate
    ? format(task.dueDate, "short", "ja")
    : null;

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderLeftWidth="4px"
      borderLeftColor={`${priorityColor}.500`}
      bg={["white", "black"]}
      opacity={isCompleted ? 0.7 : 1}
      _hover={{ shadow: "sm" }}
      transition="all 0.2s"
      position="relative"
    >
      <Box position="absolute" top="8px" right="8px">
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="タスクの操作"
            icon={<EllipsisIcon />}
            size="sm"
            variant="ghost"
          />
          <MenuList>
            <MenuItem
              onClick={() => handleUpdateToStatus(TaskStatus.TODO)}
              isDisabled={task.status === TaskStatus.TODO || isPending}
            >
              未着手に移動
            </MenuItem>
            <MenuItem
              onClick={() => handleUpdateToStatus(TaskStatus.IN_PROGRESS)}
              isDisabled={task.status === TaskStatus.IN_PROGRESS || isPending}
            >
              進行中に移動
            </MenuItem>
            <MenuItem
              onClick={() => handleUpdateToStatus(TaskStatus.DONE)}
              isDisabled={task.status === TaskStatus.DONE || isPending}
            >
              完了に移動
            </MenuItem>
            <MenuItem onClick={() => onEdit(task)}>編集</MenuItem>
            <MenuItem onClick={() => onDelete(task)} color="red.500">
              削除
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <Stack direction={{ base: "column", md: "row" }}>
        <HStack alignItems="flex-start" flex={1}>
          <Tooltip
            label={isCompleted ? "タスクを未完了にする" : "タスクを完了する"}
          >
            <IconButton
              aria-label={
                isCompleted ? "タスクを未完了にする" : "タスクを完了する"
              }
              icon={isCompleted ? <CircleCheckBigIcon /> : <CircleIcon />}
              variant="ghost"
              colorScheme={isCompleted ? "green" : "gray"}
              size="sm"
              isLoading={isPending}
              onClick={handleToggleStatus}
            />
          </Tooltip>

          <VStack align="start" flex={1}>
            <Stack w="full" direction={{ base: "row", md: "column" }}>
              <Text
                fontWeight="medium"
                textDecoration={isCompleted ? "line-through" : "none"}
                color={isCompleted ? "gray.500" : "inherit"}
              >
                {task.title}
              </Text>

              {showLecture && task.registrationId && (
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  alignSelf={{ base: "flex-start" }}
                >
                  {registrationLabel ?? "講義"}
                </Badge>
              )}
            </Stack>

            {task.description && (
              <Text
                fontSize="sm"
                color={isCompleted ? "gray.400" : "gray.600"}
                textDecoration={isCompleted ? "line-through" : "none"}
              >
                {task.description}
              </Text>
            )}

            <Flex
              fontSize="xs"
              color="gray.500"
              direction={{ base: "column", md: "row" }}
              align={{ base: "flex-start", md: "center" }}
              gap={1}
            >
              {formattedDueDate && <Text>期限: {formattedDueDate}</Text>}
              <Text>
                優先度:
                <Badge ml={1} colorScheme={priorityColor} variant="subtle">
                  {task.priority === TaskPriority.LOW
                    ? "低"
                    : task.priority === TaskPriority.MEDIUM
                      ? "中"
                      : "高"}
                </Badge>
              </Text>
            </Flex>
          </VStack>
        </HStack>
      </Stack>
    </Box>
  );
};

export default TaskItem;
