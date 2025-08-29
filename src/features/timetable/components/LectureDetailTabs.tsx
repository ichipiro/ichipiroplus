"use client";

import TasksDashboard from "@/features/task/components/TaskDashboard";
import type { RegistrationWithRelations } from "@/features/timetable/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import type { Task } from "@prisma/client";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { unregisterById } from "../actions/registrations";
import AttendanceCounter from "./AttendanceCounter";
import LectureSettingsTab from "./LectureSettingTab";

interface LectureDetailTabsProps {
  registration: RegistrationWithRelations;
  tasks: Task[];
}

const LectureDetailTabs = ({ registration, tasks }: LectureDetailTabsProps) => {
  const router = useRouter();
  const { withFeedback } = useActionFeedback();
  const [isPending, startTransition] = useTransition();

  // 講義登録を削除
  const handleDeleteRegistration = () => {
    startTransition(async () => {
      const result = await withFeedback(unregisterById(registration.id), {
        successMessage: "講義の登録を削除しました",
        successTitle: "登録削除",
      });

      if (result !== undefined) {
        // 時間割ページにリダイレクト
        router.push("/timetable");
      }
    });
  };

  return (
    <>
      <Tabs w="full" variant="rounded" colorScheme="blue">
        <TabList>
          <Tab>出席</Tab>
          <Tab>タスク管理</Tab>
          <Tab>設定</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AttendanceCounter
              registrationId={registration.id}
              initialCount={registration.attendanceCount}
              externalSystemUrl="https://ichipol.g.hiroshima-cu.ac.jp/uprx/MobileShibbolethAuthServlet"
            />
          </TabPanel>

          <TabPanel>
            <TasksDashboard
              initialTasks={tasks}
              registration_id={String(registration.id)}
            />
          </TabPanel>

          <TabPanel>
            <LectureSettingsTab
              lecture={registration.lecture}
              onDeleteRegistration={handleDeleteRegistration}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default LectureDetailTabs;
