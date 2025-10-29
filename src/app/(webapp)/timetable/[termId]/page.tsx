import { getTerm } from "@/features/timetable/actions/terms";
import TimetableGrid from "@/features/timetable/components/TimetableGrid";
import TimetablePicker from "@/features/timetable/components/TimetablePicker";
import { Box, HStack, Heading, VStack } from "@yamada-ui/react";

interface TimeTablePageProps {
  params: {
    termId: string;
  };
}

const TimeTablePage = async ({ params }: TimeTablePageProps) => {
  const term = await getTerm(params.termId);

  return (
    <VStack alignItems="center" gap={4}>
      {/* ヘッダー部分 */}
      <Box w="full" maxW="1200px">
        <HStack justify="space-between" mb={4}>
          <Heading size="lg">
            {term.year}年度 第{term.number}ターム
          </Heading>
        </HStack>
      </Box>

      {/* 年度・ターム選択 */}
      <TimetablePicker nowTerm={term} />

      {/* 時間割グリッド */}
      <TimetableGrid termId={params.termId} />
    </VStack>
  );
};

export default TimeTablePage;
