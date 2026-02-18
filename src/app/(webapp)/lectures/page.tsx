import { getLectureCatalogPage } from "@/features/timetable/actions/lectures";
import { getMyRegistrations } from "@/features/timetable/actions/registrations";
import { getCurrentTerm } from "@/features/timetable/actions/terms";
import LectureRegisterButton from "@/features/timetable/components/LectureRegisterButton";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  NativeTable,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@yamada-ui/react";
import type { Metadata } from "next";
import Link from "next/link";

const PAGE_SIZE = 50;

const DAY_LABELS: Record<number, string> = {
  1: "月",
  2: "火",
  3: "水",
  4: "木",
  5: "金",
};

const parsePage = (value?: string) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) {
    return 1;
  }

  return Math.floor(num);
};

const buildPageHref = (page: number) => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  return `/lectures?${params.toString()}`;
};

const formatTerms = (termNumbers: number[]) => {
  if (termNumbers.length === 0) return "未設定";
  return termNumbers.map(n => `T${n}`).join(", ");
};

const formatSchedules = (schedules: { day: number; time: number }[]) => {
  if (schedules.length === 0) return "未設定";
  return schedules
    .map(s => `${DAY_LABELS[s.day] ?? s.day}曜${s.time}限`)
    .join(", ");
};

export const metadata: Metadata = {
  title: "講義検索",
  description: "すべての公開講義をテーブル形式で閲覧できます",
};

type LecturesPageProps = {
  searchParams?: { page?: string };
};

const LecturesPage = async ({ searchParams }: LecturesPageProps) => {
  const currentTerm = await getCurrentTerm();
  const page = parsePage(searchParams?.page);
  const [{ lectures, totalCount }, myRegistrations] = await Promise.all([
    getLectureCatalogPage({
      page,
      pageSize: PAGE_SIZE,
    }),
    getMyRegistrations(currentTerm.id),
  ]);
  const registeredLectureIds = new Set(myRegistrations.map(r => r.lectureId));
  const registrationIdByLectureId = new Map(
    myRegistrations.map(registration => [
      registration.lectureId,
      registration.id,
    ]),
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <VStack w="full" align="stretch" gap={6}>
      <Flex
        w="full"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        gap={3}
      >
        <Heading as="h1" size="xl">
          講義検索
        </Heading>
        <Badge colorScheme="blue" variant="subtle">
          {totalCount.toLocaleString()}件
        </Badge>
      </Flex>

      <Text color="gray.600">
        公開講義を一覧表示しています。講義名をクリックすると詳細ページへ移動できます。
      </Text>

      <TableContainer w="full">
        <NativeTable
          withBorder
          withColumnBorders
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <Thead>
            <Tr>
              <Th
                w={{ base: "16%", md: "0%" }}
                display={{ base: "table-cell", md: "none" }}
              >
                シラバスコード
              </Th>
              <Th w={{ base: "28%", md: "48%" }}>講義名</Th>
              <Th w={{ base: "16%", md: "30%" }}>担当教員</Th>
              <Th
                w={{ base: "10%", md: "0%" }}
                display={{ base: "table-cell", md: "none" }}
              >
                ターム
              </Th>
              <Th
                w={{ base: "18%", md: "0%" }}
                display={{ base: "table-cell", md: "none" }}
              >
                曜日時限
              </Th>
              <Th w={{ base: "12%", md: "22%" }}>登録</Th>
            </Tr>
          </Thead>
          <Tbody>
            {lectures.map(lecture => (
              <Tr key={lecture.id}>
                <Td
                  display={{ base: "table-cell", md: "none" }}
                  overflow="hidden"
                >
                  <Text
                    display="block"
                    w="full"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    title={lecture.syllabusCode ?? "-"}
                  >
                    {lecture.syllabusCode ?? "-"}
                  </Text>
                </Td>
                <Td overflow="hidden">
                  <Link
                    href={`/lectures/${lecture.id}`}
                    style={{ display: "block", width: "100%" }}
                  >
                    <Text
                      as="span"
                      color="primary.500"
                      fontWeight="semibold"
                      title={lecture.name}
                      display="block"
                      w="full"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {lecture.name}
                    </Text>
                  </Link>
                </Td>
                <Td overflow="hidden">
                  <Text
                    title={lecture.instructor || "-"}
                    display="block"
                    w="full"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {lecture.instructor || "-"}
                  </Text>
                </Td>
                <Td
                  display={{ base: "table-cell", md: "none" }}
                  overflow="hidden"
                >
                  <Text
                    display="block"
                    w="full"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    title={formatTerms(
                      lecture.lectureTerms.map(t => t.termNumber),
                    )}
                  >
                    {formatTerms(lecture.lectureTerms.map(t => t.termNumber))}
                  </Text>
                </Td>
                <Td
                  display={{ base: "table-cell", md: "none" }}
                  overflow="hidden"
                >
                  <Text
                    display="block"
                    w="full"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    title={formatSchedules(lecture.schedules)}
                  >
                    {formatSchedules(lecture.schedules)}
                  </Text>
                </Td>
                <Td overflow="hidden">
                  <LectureRegisterButton
                    lectureId={lecture.id}
                    termId={currentTerm.id}
                    isRegistered={registeredLectureIds.has(lecture.id)}
                    registrationId={registrationIdByLectureId.get(lecture.id)}
                    canRegister={lecture.lectureTerms.some(
                      t => t.termNumber === currentTerm.number,
                    )}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </NativeTable>
      </TableContainer>

      {lectures.length === 0 && (
        <Box py={8}>
          <Text color="gray.600">表示できる講義がありません。</Text>
        </Box>
      )}

      <HStack justify="space-between" w="full">
        <Button
          as={Link}
          href={buildPageHref(Math.max(1, page - 1))}
          isDisabled={page <= 1}
          variant="outline"
        >
          前へ
        </Button>

        <Text>
          {page} / {totalPages} ページ
        </Text>

        <Button
          as={Link}
          href={buildPageHref(Math.min(totalPages, page + 1))}
          isDisabled={page >= totalPages}
          variant="outline"
        >
          次へ
        </Button>
      </HStack>
    </VStack>
  );
};

export default LecturesPage;
