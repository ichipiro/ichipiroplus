import { formatDayTimeLabel } from "@/features/timetable/utils";
import { Box, Grid, GridItem, Text, VStack } from "@yamada-ui/react";

const formatSchedules = (schedules: { day: number; time: number }[]) => {
  if (schedules.length === 0) return "未設定";
  return schedules
    .map(schedule => formatDayTimeLabel(schedule.day, schedule.time))
    .join(", ");
};

const formatTerms = (termNumbers: number[]) => {
  if (termNumbers.length === 0) return "未設定";
  return termNumbers.map(termNumber => `第${termNumber}ターム`).join(" / ");
};

interface LectureCatalogMetaGridProps {
  lecture: {
    instructor: string;
    room: string | null;
    units: number;
    schedules: { day: number; time: number }[];
    lectureTerms: { termNumber: number }[];
    departments: { id: string; name: string }[];
    owner: { displayName: string; username: string };
  };
}

const LectureCatalogMetaGrid = ({ lecture }: LectureCatalogMetaGridProps) => {
  return (
    <Grid templateColumns={{ base: "1fr 1fr", md: "1fr" }} gap={4}>
      <GridItem>
        <Box borderWidth="1px" borderRadius="md" p={4}>
          <Text fontWeight="bold" mb={2}>
            基本情報
          </Text>
          <VStack align="start" gap={1}>
            <Text>担当教員: {lecture.instructor || "未設定"}</Text>
            <Text>教室: {lecture.room || "未設定"}</Text>
            <Text>単位数: {lecture.units}</Text>
            <Text>
              ターム:{" "}
              {formatTerms(lecture.lectureTerms.map(term => term.termNumber))}
            </Text>
            <Text>曜日時限: {formatSchedules(lecture.schedules)}</Text>
            <Text>
              作成者: {lecture.owner.displayName || lecture.owner.username}
            </Text>
          </VStack>
        </Box>
      </GridItem>

      <GridItem>
        <Box borderWidth="1px" borderRadius="md" p={4}>
          <Text fontWeight="bold" mb={2}>
            学科
          </Text>
          <VStack align="start" gap={1}>
            {lecture.departments.length > 0 ? (
              lecture.departments.map(department => (
                <Text key={department.id}>{department.name}</Text>
              ))
            ) : (
              <Text color="gray.600">未設定</Text>
            )}
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default LectureCatalogMetaGrid;
