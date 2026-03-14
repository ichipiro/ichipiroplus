import { getCurrentTerm, getTerms } from "@/features/timetable/actions/terms";
import { checkAdminAccess } from "@/lib/admin";
import { Box, HStack, Heading, Text, VStack } from "@yamada-ui/react";
import type { Metadata } from "next";
import TermForm from "./_components/TermForm";
import TermsTable from "./_components/TermsTable";

export const metadata: Metadata = {
  title: "学期管理",
  description: "学期・ターム期間の設定と管理",
};

export default async function AdminTermsPage() {
  await checkAdminAccess();

  const [terms, currentTerm] = await Promise.all([
    getTerms(),
    getCurrentTerm(),
  ]);

  return (
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">学期管理</Heading>
          <Text color="gray.600">学期・ターム期間の設定と管理</Text>
        </Box>
      </HStack>

      {/* 新規作成フォーム */}
      <TermForm />

      <TermsTable terms={terms} currentTermId={currentTerm.id} />
    </VStack>
  );
}
