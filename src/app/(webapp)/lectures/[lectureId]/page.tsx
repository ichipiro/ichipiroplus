import {
  canEditLecture,
  getLectureCatalogDetail,
} from "@/features/timetable/actions/lectures";
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  HStack,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import type { Metadata } from "next";
import Link from "next/link";

const DAY_LABELS: Record<number, string> = {
  1: "月",
  2: "火",
  3: "水",
  4: "木",
  5: "金",
};

const formatSchedules = (schedules: { day: number; time: number }[]) => {
  if (schedules.length === 0) return "未設定";
  return schedules
    .map(s => `${DAY_LABELS[s.day] ?? s.day}曜${s.time}限`)
    .join(", ");
};

const formatTerms = (termNumbers: number[]) => {
  if (termNumbers.length === 0) return "未設定";
  return termNumbers.map(n => `第${n}ターム`).join(" / ");
};

export const metadata: Metadata = {
  title: "講義詳細",
  description: "講義情報の詳細",
};

type LectureDetailPageProps = {
  params: {
    lectureId: string;
  };
};

const LectureDetailPage = async ({ params }: LectureDetailPageProps) => {
  const [lecture, canEdit] = await Promise.all([
    getLectureCatalogDetail(params.lectureId),
    canEditLecture(params.lectureId),
  ]);

  return (
    <VStack w="full" align="stretch" gap={6}>
      <HStack justify="space-between" align="start">
        <VStack align="start" gap={2}>
          <Heading as="h1" size="lg">
            {lecture.name}
          </Heading>
          <HStack gap={2} wrap="wrap">
            <Badge colorScheme="blue">
              シラバス: {lecture.syllabusCode ?? "未設定"}
            </Badge>
            <Badge colorScheme="teal">{lecture.grade}年対象</Badge>
            {lecture.isRequired && <Badge colorScheme="orange">必修</Badge>}
            {lecture.isExam && <Badge colorScheme="red">試験あり</Badge>}
          </HStack>
        </VStack>

        <HStack>
          <Button
            as={Link}
            href={`/lectures/${lecture.id}/edit`}
            colorScheme="blue"
            isDisabled={!canEdit}
          >
            編集
          </Button>
          <Button as={Link} href="/lectures" variant="outline">
            一覧に戻る
          </Button>
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
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
                {formatTerms(lecture.lectureTerms.map(t => t.termNumber))}
              </Text>
              <Text>曜日時限: {formatSchedules(lecture.schedules)}</Text>
              <Text>
                担当者: {lecture.owner.displayName || lecture.owner.username}
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
                lecture.departments.map(dept => (
                  <Text key={dept.id}>{dept.name}</Text>
                ))
              ) : (
                <Text color="gray.600">未設定</Text>
              )}
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      <Divider />

      <VStack align="stretch" gap={4}>
        <Box>
          <Text fontWeight="bold" mb={1}>
            授業目的
          </Text>
          <Text color="gray.700">{lecture.purpose || "未設定"}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            到達目標
          </Text>
          <Text color="gray.700">{lecture.goal || "未設定"}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            授業内容
          </Text>
          <Text color="gray.700">{lecture.description || "未設定"}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            評価方法
          </Text>
          <Text color="gray.700">{lecture.evalMethod || "未設定"}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            教科書
          </Text>
          <Text color="gray.700">{lecture.textbook || "未設定"}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            フィードバック
          </Text>
          <Text color="gray.700">{lecture.feedback || "未設定"}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            備考
          </Text>
          <Text color="gray.700">{lecture.biko || "未設定"}</Text>
        </Box>
      </VStack>
    </VStack>
  );
};

export default LectureDetailPage;
