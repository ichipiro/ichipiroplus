import type {
  RegistrationWithRelations,
  Term,
} from "@/features/timetable/types";
import { Grid, GridItem, Text, VStack } from "@yamada-ui/react";
import Link from "next/link";
import React from "react";

interface TimeTableGridProps {
  registrationsMap: Map<number, RegistrationWithRelations>;
  term: Term;
}

const DAYS = [1, 2, 3, 4, 5];
const TIMES = [1, 2, 3, 4, 5];
const MAX_TIME = 5;
const TIMES_VALUE = [
  "9:00~10:30",
  "10:40~12:10",
  "13:00~14:30",
  "14:40~16:10",
  "16:20~17:50",
];

const TimeTableGrid = ({ registrationsMap, term }: TimeTableGridProps) => {
  return (
    <Grid
      templateColumns={{
        base: "repeat(5, 3fr) 1fr",
        md: "repeat(5, 1fr)",
      }}
      templateRows={{ base: "1fr repeat(5, 3fr)" }}
      gap="xs"
      w="full"
      h="75vh"
      overflow="hidden"
    >
      {/* 曜日ヘッダー */}
      {DAYS.map(day => (
        <GridItem key={day} textAlign={"center"} alignContent={"center"}>
          <Text>{["月", "火", "水", "木", "金", "土", "日"][day - 1]}曜日</Text>
        </GridItem>
      ))}
      <GridItem display={{ base: "block", md: "none" }} />

      {/* 講義セル */}
      {TIMES.map(time => (
        <React.Fragment key={time}>
          {DAYS.map(day => {
            const key = (day - 1) * MAX_TIME + time;
            const registration = registrationsMap.get(key);
            const lecture = registration?.lecture;
            return (
              <Link key={key} href={`/timetable/${term.id}/${key}`} passHref>
                <GridItem
                  key={key}
                  bg={["white", "black"]}
                  p={{ base: "md", md: "xs" }}
                  border="1px solid"
                  borderColor="gray.500"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: ["gray.50", "gray.700"] }}
                  h="full"
                  w="full"
                >
                  <VStack
                    h="full"
                    w="full"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {lecture ? (
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
                    ) : (
                      <Text color="gray.500">クリックして追加</Text>
                    )}
                  </VStack>
                </GridItem>
              </Link>
            );
          })}

          {/* 時間表示 */}
          <GridItem position="relative" display={{ base: "block", md: "none" }}>
            <Text
              fontWeight="bold"
              position="absolute"
              right="sm"
              top="50%"
              transform={{
                base: "translateY(-50%)  rotate(90deg)",
                md: "translateY(-50%) translateX(50%) rotate(90deg)",
              }}
              transformOrigin="center center"
            >
              {TIMES_VALUE[time - 1]}
            </Text>
          </GridItem>
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default TimeTableGrid;
