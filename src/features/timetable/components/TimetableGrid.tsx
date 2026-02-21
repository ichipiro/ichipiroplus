import { Grid, GridItem, Text, VStack } from "@yamada-ui/react";
import Link from "next/link";
import React from "react";
import { DAYS, TIMES, TIMES_VALUE } from "../constant";
import { getScheduleKey } from "../utils";
import TimetableCell from "./TimetableCell";

interface TimeTableGridProps {
  termId: string;
  readonly?: boolean;
  targetUserId?: string;
}

const TimeTableGrid = ({
  termId,
  readonly = false,
  targetUserId,
}: TimeTableGridProps) => {
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
            const key = getScheduleKey(day, time);
            const cell = (
              <GridItem
                bg={["white", "black"]}
                p={{ base: "md", md: "xs" }}
                border="1px solid"
                borderColor="gray.500"
                borderRadius="md"
                cursor={readonly ? "default" : "pointer"}
                _hover={readonly ? undefined : { bg: ["gray.50", "gray.700"] }}
                h="full"
                w="full"
              >
                <VStack
                  h="full"
                  w="full"
                  alignItems="center"
                  justifyContent="center"
                >
                  <TimetableCell
                    termId={termId}
                    scheduleKey={key}
                    targetUserId={targetUserId}
                    readonly={readonly}
                  />
                </VStack>
              </GridItem>
            );

            if (readonly) {
              return <React.Fragment key={key}>{cell}</React.Fragment>;
            }

            return (
              <Link href={`/timetable/${termId}/${key}`} key={key} passHref>
                {cell}
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
