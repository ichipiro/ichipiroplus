import { getMyRegistrations } from "@/features/timetable/actions/registrations";
import { getTerm, getTerms } from "@/features/timetable/actions/terms";
import TimetableGrid from "@/features/timetable/components/TimetableGrid";
import TimetablePicker from "@/features/timetable/components/TimetablePicker";
import { buildRegistrationMap } from "@/features/timetable/utils";
import { Box, HStack, Heading, VStack } from "@yamada-ui/react";

interface TimeTablePageProps {
  params: {
    termId: string;
  };
}

const TimeTablePage = async ({ params }: TimeTablePageProps) => {
  const term = await getTerm(params.termId);
  const allTerms = await getTerms();
  const registrations = await getMyRegistrations(term.id);
  const registrationsMap = buildRegistrationMap(registrations);

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
      <TimetablePicker nowTerm={term} allTerms={allTerms} />

      {/* 時間割グリッド */}
      <TimetableGrid registrationsMap={registrationsMap} term={term} />
    </VStack>
  );
};

export default TimeTablePage;
