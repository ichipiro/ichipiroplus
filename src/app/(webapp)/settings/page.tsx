import SettingsTabSwitcher, {
  type SettingsTabItem,
} from "@/app/(webapp)/settings/_components/SettingsTabSwitcher";
import {
  getAllDepartments,
  getAllFaculties,
  getCurrentUser,
} from "@/features/user/actions";
import AccountSettings from "@/features/user/components/AccountSettings";
import DisplaySettings from "@/features/user/components/DisplaySettings";
import MyProfileEditForm from "@/features/user/components/MyProfileEditForm";
import NotificationSettings from "@/features/webpush/components/NotificationSettings";
import { Box, Heading, VStack } from "@yamada-ui/react";
import { redirect } from "next/navigation";

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

const settingsTabs: SettingsTabItem[] = [
  { key: "general", label: "一般設定" },
  { key: "notification", label: "通知" },
];

type SettingsTab = (typeof settingsTabs)[number]["key"];

const SettingsPage = async ({ searchParams }: SettingsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/register");
  }

  const departments = await getAllDepartments();
  const faculties = await getAllFaculties();

  const requestedTab = resolvedSearchParams.tab;
  const tab: SettingsTab =
    requestedTab && settingsTabs.some(tabItem => tabItem.key === requestedTab)
      ? (requestedTab as SettingsTab)
      : "general";

  return (
    <VStack w="full" align="start" gap={4}>
      <Box w="full">
        <Heading size="lg" mb={3}>
          設定
        </Heading>

        <Box
          w="full"
          overflowX="auto"
          css={{ WebkitOverflowScrolling: "touch" }}
        >
          <SettingsTabSwitcher tabs={settingsTabs} activeTab={tab} />
        </Box>
      </Box>

      {tab === "general" && (
        <VStack w="full" align="start" gap={8}>
          <Box w="full">
            <Heading size="md" mb={4}>
              プロフィール
            </Heading>
            <MyProfileEditForm
              departments={departments}
              faculties={faculties}
              user={user}
            />
          </Box>

          <Box w="full" borderTopWidth="1px" pt={6}>
            <Heading size="md" mb={4}>
              表示設定
            </Heading>
            <DisplaySettings isTimetablePublic={user.isTimetablePublic} />
          </Box>

          <Box w="full" borderTopWidth="1px" pt={6}>
            <Heading size="md" mb={4}>
              アカウント
            </Heading>
            <AccountSettings />
          </Box>
        </VStack>
      )}

      {tab === "notification" && <NotificationSettings />}
    </VStack>
  );
};

export default SettingsPage;
