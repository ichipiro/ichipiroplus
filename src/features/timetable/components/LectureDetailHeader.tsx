import DateFormat from "@/components/DateFormat";
import type { Registration } from "@/features/timetable/types";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spacer,
  Tag,
  Text,
  Wrap,
} from "@yamada-ui/react";
import { getLectureById } from "../actions/lectures";

interface LectureDetailHeaderProps {
  registration: Registration;
}

const LectureDetailHeader = async ({
  registration,
}: LectureDetailHeaderProps) => {
  const lecture = await getLectureById(registration.lectureId);

  return (
    <Card
      w="full"
      bg={["white", "black"]}
      p={6}
      borderRadius="md"
      shadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <CardHeader>
        <Heading size="lg">{lecture.name}</Heading>

        <Spacer />
      </CardHeader>
      <CardBody>
        <Wrap gap="xs">
          {lecture.room && <Tag colorScheme="blue">教室: {lecture.room}</Tag>}
          {lecture.grade && <Tag colorScheme="teal">{lecture.grade}年生</Tag>}
        </Wrap>

        <Text>
          <strong>担当教員</strong>: {lecture.instructor}
        </Text>

        <Text>
          <strong>教室</strong>: {lecture.room || "未設定"}
        </Text>

        <DateFormat
          createdAt={registration.registeredAt.toISOString()}
          updatedAt={registration.registeredAt.toISOString()}
        />
      </CardBody>
    </Card>
  );
};

export default LectureDetailHeader;
