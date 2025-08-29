import { NotificationSender } from "@/features/admin/components/NotificationSender";
import { checkAdminAccess } from "@/lib/admin";
import { Box, Heading, Text, VStack } from "@yamada-ui/react";

export default async function NotificationAdminPage() {
  await checkAdminAccess();

  return (
    <VStack>
      <Box>
        <Heading as="h1" size="lg" mb={2}>
          プッシュ通知管理
        </Heading>
        <Text color="gray.600">
          ユーザーにプッシュ通知を送信したり、通知履歴を確認できます。
        </Text>
      </Box>

      <NotificationSender />
    </VStack>
  );
}
