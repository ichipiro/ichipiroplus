import { getMyTasks } from "@/features/task/actions";
import type { RegistrationWithRelations } from "@/features/timetable/types";
import { VStack } from "@yamada-ui/react";
import LectureDetailHeader from "./LectureDetailHeader";
import LectureDetailTabs from "./LectureDetailTabs";

interface LectureDetailPageProps {
  registration: RegistrationWithRelations;
}

const LectureDetail = async ({ registration }: LectureDetailPageProps) => {
  const tasks = await getMyTasks(undefined, registration.id);

  return (
    <VStack align="start" w="full">
      {/* 講義詳細ヘッダー */}
      <LectureDetailHeader registration={registration} />

      {/* 講義詳細タブ */}
      <LectureDetailTabs registration={registration} tasks={tasks} />
    </VStack>
  );
};

export default LectureDetail;
