import { Text } from "@yamada-ui/react";
import { getLectureById, getRegistrationsBySchedule } from "../actions";

type TimetableCellProps = {
  termId: string;
  scheduleKey: number;
};

const TimetableCell = async ({ termId, scheduleKey }: TimetableCellProps) => {
  const registration = await getRegistrationsBySchedule(scheduleKey, termId);

  if (!registration) {
    return <Text color="gray.500">クリックして追加</Text>;
  }

  const lecture = await getLectureById(registration.lectureId);

  return (
    <>
      <Text
        fontSize={{ base: "md", md: "sm" }}
        fontWeight="medium"
        lineClamp={2}
        lineBreak={"anywhere"}
      >
        {lecture.name}
      </Text>

      <Text
        fontSize={{ base: "sm", md: "xs" }}
        lineBreak={"anywhere"}
        lineClamp={1}
      >
        {lecture.room || "未登録"}
      </Text>
    </>
  );
};

export default TimetableCell;
