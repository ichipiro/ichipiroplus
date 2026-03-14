import type { LectureCatalogItem } from "@/features/timetable/actions/lectures";
import { getMyRegistrations } from "@/features/timetable/actions/registrations";
import { DAY_LABELS } from "@/features/timetable/constant";
import {
  Box,
  NativeTable,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@yamada-ui/react";
import Link from "next/link";
import LectureRegisterButton from "./LectureRegisterButton";

const formatTerms = (termNumbers: number[]) => {
  if (termNumbers.length === 0) return "未設定";
  return termNumbers.join(", ");
};

const formatSchedules = (schedules: { day: number; time: number }[]) => {
  if (schedules.length === 0) return "未設定";
  return schedules
    .map(
      schedule =>
        `${DAY_LABELS[schedule.day] ?? schedule.day}曜${schedule.time}限`,
    )
    .join(", ");
};

interface LectureListProps {
  lectures: LectureCatalogItem[];
  termId: string;
  currentTermNumber: number;
  emptyMessage?: string;
}

const LectureList = async ({
  lectures,
  termId,
  currentTermNumber,
  emptyMessage = "表示できる講義がありません。",
}: LectureListProps) => {
  const myRegistrations = await getMyRegistrations(termId);
  const registeredLectureIds = new Set(myRegistrations.map(r => r.lectureId));
  const registrationIdByLectureId = new Map(
    myRegistrations.map(registration => [
      registration.lectureId,
      registration.id,
    ]),
  );

  if (lectures.length === 0) {
    return (
      <Box py={8}>
        <Text color="gray.600">{emptyMessage}</Text>
      </Box>
    );
  }

  return (
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
                    lecture.lectureTerms.map(term => term.termNumber),
                  )}
                >
                  {formatTerms(
                    lecture.lectureTerms.map(term => term.termNumber),
                  )}
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
                  termId={termId}
                  isRegistered={registeredLectureIds.has(lecture.id)}
                  registrationId={registrationIdByLectureId.get(lecture.id)}
                  canRegister={lecture.lectureTerms.some(
                    term => term.termNumber === currentTermNumber,
                  )}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </NativeTable>
    </TableContainer>
  );
};

export default LectureList;
