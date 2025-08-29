import type { Lecture } from "@/features/timetable/types";
import { getMe } from "@/features/user/actions";
import { Grid, GridItem, Text } from "@yamada-ui/react";
import LectureCard from "./LectureCard";

interface LectureListProps {
  lectures: Lecture[];
  termId: string;
}

const LectureList = async ({ lectures, termId }: LectureListProps) => {
  const userId = await getMe();

  return (
    <>
      <Text>
        ※編集は各講義の右上のボタンから出来ますが、この編集した内容は全てのユーザーに対して反映されます。データに間違いがある場合のみに使用してください
      </Text>
      {lectures.length > 0 ? (
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "repeat(1, 1fr)",
          }}
          gap="md"
          w="full"
        >
          {lectures.map(lecture => {
            //公開でない && 講義作成者でない 場合は表示しない
            if (!lecture.isPublic && userId !== lecture.ownerId) {
              return;
            }
            return (
              <GridItem key={lecture.id}>
                <LectureCard lecture={lecture} termId={termId} />
              </GridItem>
            );
          })}
        </Grid>
      ) : (
        <></>
      )}
    </>
  );
};

export default LectureList;
