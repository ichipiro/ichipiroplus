import { LectureImporter } from "@/features/admin/components/LectureImporter";
import { getCurrentTerm } from "@/features/timetable/actions/terms";
import { checkAdminAccess } from "@/lib/admin";
import { Heading, Text, VStack } from "@yamada-ui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "講義データインポート | 管理者",
  description: "講義データのインポート管理",
};

export default async function SyllabusImportPage() {
  // 管理者権限チェック
  await checkAdminAccess();
  const currentTerm = await getCurrentTerm();

  return (
    <VStack gap={6} align="stretch">
      <div>
        <Heading as="h1" size="lg" mb={2}>
          講義データインポート
        </Heading>
        <Text color="gray.600">
          スクレイパーで生成したJSONファイルをアップロードして、
          講義データをデータベースにインポートします。
        </Text>
      </div>

      <LectureImporter defaultAcademicYear={currentTerm.academicYear} />

      <Text fontSize="sm" color="gray.500">
        注意:
        大量のデータをインポートする場合は、システムへの負荷にご注意ください。
        インポートは既存データを更新（upsert）するため、重複の心配はありません。
      </Text>
    </VStack>
  );
}
