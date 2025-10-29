import { getMyTasks } from "@/features/task/actions";
import TasksDashboard from "@/features/task/components/TaskDashboard";
import { getLectureById } from "@/features/timetable/actions";
import { getMyRegistrations } from "@/features/timetable/actions/registrations";
import { getCurrentTerm } from "@/features/timetable/actions/terms";
import { Box, Heading, type SelectItem, VStack } from "@yamada-ui/react";

const TasksPage = async () => {
  const term = await getCurrentTerm();
  const tasks = await getMyTasks();
  const registrations = await getMyRegistrations(term.id);

  const lectureItems: SelectItem[] | undefined = await Promise.all(
    registrations?.map(async registration => {
      const lecture = await getLectureById(registration.lectureId);
      return {
        label: lecture.name,
        value: String(registration.id),
      } as SelectItem;
    }),
  );

  return (
    <VStack w="full" align="start">
      <Box w="full">
        <Heading size="xl" mb={2}>
          タスク管理
        </Heading>
      </Box>

      {/* タスクダッシュボード */}
      <Box w="full">
        <TasksDashboard initialTasks={tasks} lectureItems={lectureItems} />
      </Box>
    </VStack>
  );
};

export default TasksPage;
