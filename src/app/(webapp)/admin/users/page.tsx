import { checkAdminAccess } from "@/lib/admin";
import { Info } from "@yamada-ui/lucide";
import {
  Alert,
  AlertDescription,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ユーザー管理 | 管理者",
  description: "ユーザー管理機能",
};

export default async function UsersPage() {
  // 管理者権限チェック
  await checkAdminAccess();

  return (
    <VStack gap={6} align="stretch">
      <div>
        <Heading as="h1" size="lg" mb={2}>
          ユーザー管理
        </Heading>
        <Text color="gray.600">システムに登録されているユーザーの管理</Text>
      </div>

      <Alert status="info" variant="subtle">
        <Info />
        <AlertDescription ml={3}>
          この機能は現在開発中です。今後のアップデートで利用可能になります。
        </AlertDescription>
      </Alert>
    </VStack>
  );
}
