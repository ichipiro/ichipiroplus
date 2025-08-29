"use client";

import TaskItem from "@/features/task/components/TaskItem";
import type { TaskWithRelations } from "@/features/task/types";
import { Box, HStack, Heading, Text, VStack } from "@yamada-ui/react";
import type { ReactNode } from "react";

interface TaskColumnProps {
  title: string;
  tasks: TaskWithRelations[];
  extraHeader?: ReactNode;
}

const TaskColumn = ({ title, tasks, extraHeader }: TaskColumnProps) => {
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
              showLecture={true} // 講義ページと区別するために常に講義名を表示
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default TaskColumn;
