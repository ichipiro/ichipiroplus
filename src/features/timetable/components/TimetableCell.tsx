import { Text } from "@yamada-ui/react";

type TimetableCellProps = {
  lecture?: { name: string; room: string | null };
  readonly?: boolean;
};

const TimetableCell = ({ lecture, readonly = false }: TimetableCellProps) => {
  if (!lecture) {
    return <Text color="gray.500">{readonly ? "-" : "クリックして追加"}</Text>;
  }

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
