import TaskItem from "@/features/task/components/TaskItem";
import type { Task } from "@prisma/client";
import { Box, HStack, Heading, Text, VStack } from "@yamada-ui/react";
import type { ReactNode } from "react";
import type { TaskStatusType } from "../types";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  extraHeader?: ReactNode;
  isPending: boolean;
  onUpdateStatus: (taskId: string, status: TaskStatusType) => Promise<Task>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  registrationLabels?: Record<string, ReactNode>;
}

const TaskColumn = ({
  title,
  tasks,
  extraHeader,
  isPending,
  onUpdateStatus,
  onEdit,
  onDelete,
  registrationLabels,
}: TaskColumnProps) => {
  return (
    <Box>
      <HStack justifyContent="space-between" mb={4}>
        <Heading size="sm">
          {title} ({tasks.length})
        </Heading>
        {extraHeader}
      </HStack>

      {tasks.length === 0 ? (
        <Box py={8} textAlign="center">
          <Text color="gray.500">タスクがありません</Text>
        </Box>
      ) : (
        <VStack align="stretch" maxH="lg" px={1}>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              showLecture
              isPending={isPending}
              onUpdateStatus={onUpdateStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              registrationLabel={
                task.registrationId
                  ? registrationLabels?.[task.registrationId] ?? undefined
                  : undefined
              }
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default TaskColumn;
