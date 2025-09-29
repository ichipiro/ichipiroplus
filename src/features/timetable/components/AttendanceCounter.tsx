"use client";

import useActionFeedback from "@/hooks/useActionFeedback";
import { ExternalLinkIcon, MinusIcon, PlusIcon } from "@yamada-ui/lucide";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CircleProgress,
  CircleProgressLabel,
  Flex,
  Heading,
  IconButton,
  Text,
  Tooltip,
  VStack,
} from "@yamada-ui/react";
import { useState, useTransition } from "react";
import {
  decrementAttendance,
  incrementAttendance,
} from "../actions/attendance";

interface AttendanceCounterProps {
  registrationId: string;
  initialCount: number;
  externalSystemUrl?: string;
  lectureName?: string;
}

const AttendanceCounter = ({
  registrationId,
  initialCount = 0,
  externalSystemUrl,
  lectureName = "講義",
}: AttendanceCounterProps) => {
  const [attendanceCount, setAttendanceCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const { withFeedback } = useActionFeedback();

  const handleAttendanceIncrement = () => {
    if (isPending || attendanceCount >= 15) return;

    startTransition(async () => {
      const updated = await withFeedback(incrementAttendance(registrationId), {
        successMessage: "出席を記録しました",
        successTitle: "出席登録",
      });

      if (updated) {
        setAttendanceCount(updated);
      }
    });
  };

  const handleAttendanceDecrement = () => {
    if (isPending || attendanceCount <= 0) return;

    startTransition(async () => {
      const updated = await withFeedback(decrementAttendance(registrationId), {
        successMessage: "出席回数を減らしました",
        successTitle: "出席更新",
      });

      if (updated) {
        setAttendanceCount(updated);
      }
    });
  };

  const handleExternalSystemNavigate = () => {
    if (externalSystemUrl) {
      window.open(externalSystemUrl, "_blank");
    }
  };

  const attendancePercentage = (attendanceCount / 15) * 100;

  // 進行状況に応じた色を設定
  const progressColor =
    attendancePercentage < 40
      ? "red"
      : attendancePercentage < 70
        ? "orange"
        : attendancePercentage < 90
          ? "yellow"
          : "green";

  return (
    <Card w="full">
      <CardHeader>
        <Heading size="md">出席管理</Heading>
      </CardHeader>
      <CardBody>
        <VStack gap={6} align="center">
          {/* 出席回数の説明 */}
          <Text align="center">
            {lectureName}の出席状況: {attendanceCount} / {15}回
          </Text>

          {/* 円形プログレスと操作ボタン */}
          <Flex align="center" justify="center" direction="row" gap={6}>
            {/* 減少ボタン */}
            <Tooltip label="出席回数を減らす">
              <IconButton
                aria-label="出席回数を減らす"
                icon={<MinusIcon />}
                onClick={handleAttendanceDecrement}
                disabled={attendanceCount <= 0}
                loading={isPending}
                colorScheme="red"
                variant="outline"
                size="lg"
                rounded="full"
              />
            </Tooltip>

            {/* 円形プログレス */}
            <CircleProgress
              value={attendancePercentage}
              boxSize={{ md: "80px", base: "150px" }}
              thickness="8px"
              color={progressColor}
            >
              <CircleProgressLabel fontSize="2xl" fontWeight="bold">
                {attendanceCount}
              </CircleProgressLabel>
            </CircleProgress>

            {/* 増加ボタン */}
            <Tooltip label="出席を記録する">
              <IconButton
                aria-label="出席を記録する"
                icon={<PlusIcon />}
                onClick={handleAttendanceIncrement}
                disabled={attendanceCount >= 15}
                loading={isPending}
                colorScheme="blue"
                variant="outline"
                rounded={"full"}
                size={"lg"}
              />
            </Tooltip>
          </Flex>

          {/* 外部システムボタン */}
          {externalSystemUrl && (
            <Button
              onClick={handleExternalSystemNavigate}
              endIcon={<ExternalLinkIcon />}
              colorScheme="teal"
              variant="outline"
              mt={4}
              w="full"
              maxW="md"
            >
              学内出席システムへ移動
            </Button>
          )}

          {/* 注意事項 */}

          <Text color="orange.500" fontSize="sm" textAlign="center">
            注意: 学内の出席システム(UNIPA)とは同期しておりません。
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default AttendanceCounter;
