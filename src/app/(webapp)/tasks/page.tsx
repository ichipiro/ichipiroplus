import { getMyTasks } from "@/features/task/actions";
import TasksDashboard from "@/features/task/components/TaskDashboard";
import { getMyRegistrations } from "@/features/timetable/actions/registrations";
import { getCurrentTerm } from "@/features/timetable/actions/terms";
import { Box, Heading, VStack } from "@yamada-ui/react";

const TasksPage = async () => {
  const term = await getCurrentTerm();
  const tasks = await getMyTasks();
  const registrations = await getMyRegistrations(term.id);

  return (
    <VStack w="full" align="start">
      <Box w="full">
        <Heading size="xl" mb={2}>
          タスク管理
        </Heading>
      </Box>

      {/* タスクダッシュボード */}
      <Box w="full">
        <TasksDashboard initialTasks={tasks} registrations={registrations} />
      </Box>
    </VStack>
  );
};

export default TasksPage;
