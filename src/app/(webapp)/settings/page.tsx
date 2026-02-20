import {
  getAllDepartments,
  getAllFaculties,
  getCurrentUser,
} from "@/features/user/actions";
import AccountSettings from "@/features/user/components/AccountSettings";
import DisplaySettings from "@/features/user/components/DisplaySettings";
import MyProfileEditForm from "@/features/user/components/MyProfileEditForm";
import NotificationSettings from "@/features/webpush/components/NotificationSettings";
import { Box, Button, ButtonGroup, Heading, VStack } from "@yamada-ui/react";
import { redirect } from "next/navigation";

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

const settingsTabs = [
  { key: "general", label: "一般設定" },
  { key: "notification", label: "通知" },
] as const;

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
          <ButtonGroup
            attached
            variant="outline"
            w="max-content"
            minW="full"
            flexWrap="nowrap"
          >
            {settingsTabs.map(tabItem => (
              <Button
                key={tabItem.key}
                as="a"
                href={`/settings?tab=${tabItem.key}`}
                colorScheme={tab === tabItem.key ? "blue" : "gray"}
                whiteSpace="nowrap"
              >
                {tabItem.label}
              </Button>
            ))}
          </ButtonGroup>
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
