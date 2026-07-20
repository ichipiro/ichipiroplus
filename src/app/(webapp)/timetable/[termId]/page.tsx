import { getTimetableByUserId } from "@/features/timetable/actions/sharing";
import { getTerm } from "@/features/timetable/actions/terms";
import TimetableGrid from "@/features/timetable/components/TimetableGrid";
import TimetablePicker from "@/features/timetable/components/TimetablePicker";
import TimetableShareQrButton from "@/features/timetable/components/TimetableShareQrButton";
import { getCurrentUser } from "@/features/user/actions";
import {
  Box,
  HStack,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@yamada-ui/react";
import Link from "next/link";

interface TimeTablePageProps {
  params: Promise<{
    termId: string;
  }>;
}

const TimeTablePage = async ({ params }: TimeTablePageProps) => {
  const { termId } = await params;
  const [term, currentUser] = await Promise.all([
    getTerm(termId),
    getCurrentUser(),
  ]);
  const timetableData = await getTimetableByUserId({
    userId: currentUser.id,
    includePrivate: true,
    termId,
  });

  return (
    <VStack alignItems="center" gap={4}>
      {/* ヘッダー部分 */}
      <Box w="full" maxW="1200px">
        <HStack justify="space-between" mb={4} wrap="wrap" gap={3}>
          <Heading size="lg" flex="1">
            {term.academicYear}年度 第{term.number}ターム
          </Heading>
          <TimetableShareQrButton
            sharePath={`/${currentUser.username}?tab=timetable&termId=${termId}`}
            isPublic={currentUser.isTimetablePublic}
          />
        </HStack>
      </Box>

      {/* 年度・ターム選択 */}
      <TimetablePicker nowTerm={term} />

      {/* モバイル向け関連機能リンク */}
      <Box w="full" maxW="1200px" display={{ base: "none", md: "block" }}>
        <Heading size="sm" mb={2}>
          関連機能
        </Heading>
        <SimpleGrid columns={2} gap={3}>
          <Link href="/lectures" style={{ textDecoration: "none" }}>
            <Box
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg={["white", "gray.800"]}
              _hover={{ shadow: "sm" }}
            >
              <Text fontWeight="medium">講義検索</Text>
              <Text fontSize="sm" color="gray.500">
                全講義一覧から講義を探す
              </Text>
            </Box>
          </Link>

          <Link href="/lectures/new" style={{ textDecoration: "none" }}>
            <Box
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg={["white", "gray.800"]}
              _hover={{ shadow: "sm" }}
            >
              <Text fontWeight="medium">講義追加</Text>
              <Text fontSize="sm" color="gray.500">
                自主ゼミやサークル予定を登録
              </Text>
            </Box>
          </Link>
        </SimpleGrid>
      </Box>

      {/* 時間割グリッド */}
      <TimetableGrid termId={termId} items={timetableData.items} />
    </VStack>
  );
};

export default TimeTablePage;
