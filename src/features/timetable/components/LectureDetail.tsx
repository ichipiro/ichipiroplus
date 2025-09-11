import { getMyTasks } from "@/features/task/actions";
import TasksDashboard from "@/features/task/components/TaskDashboard";
import type { Registration } from "@prisma/client";
import { Button, ButtonGroup, VStack } from "@yamada-ui/react";
import Link from "next/link";
import { getLectureById } from "../actions";
import AttendanceCounter from "./AttendanceCounter";
import LectureDetailHeader from "./LectureDetailHeader";
import LectureSettingsTab from "./LectureSettingTab";

interface LectureDetailPageProps {
  tab: string;
  registration: Registration;
}

const LectureDetail = async ({ tab, registration }: LectureDetailPageProps) => {
  const tasks = await getMyTasks(undefined, registration.id);
  const lecture = await getLectureById(registration.lectureId);

  return (
    <VStack align="start" w="full">
      {/* 講義詳細ヘッダー */}
      <LectureDetailHeader registration={registration} />

      <ButtonGroup attached variant="outline">
        <Button>
          <Link href={"?tab=attendance"}>出席 </Link>
        </Button>
        <Button>
          <Link href={"?tab=tasks"}>タスク管理</Link>
        </Button>
        <Button>
          <Link href={"?tab=settings"}>設定</Link>
        </Button>
      </ButtonGroup>

      {tab === "attendance" && (
        <AttendanceCounter
          registrationId={registration.id}
          initialCount={registration.attendanceCount}
          externalSystemUrl="https://ichipol.g.hiroshima-cu.ac.jp/uprx/MobileShibbolethAuthServlet"
        />
      )}

      {tab === "tasks" && (
        <TasksDashboard
          initialTasks={tasks}
          registrationId={String(registration.id)}
        />
      )}

      {tab === "settings" && (
        <LectureSettingsTab
          lecture={lecture}
          registrationId={registration.id}
        />
      )}
    </VStack>
  );
};

export default LectureDetail;
