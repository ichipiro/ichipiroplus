"use client";

import useActionFeedback from "@/hooks/useActionFeedback";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Spacer,
  Tag,
  Text,
  Tooltip,
  VStack,
} from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { registerForLecture } from "../actions/registrations";
import type { Lecture } from "../types";

interface LectureCardProps {
  lecture: Lecture;
  termId: string;
}

const LectureCard = ({ lecture, termId }: LectureCardProps) => {
  const { withFeedback } = useActionFeedback();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRegister = (id: string) => {
    startTransition(async () => {
      const register = await withFeedback(registerForLecture(id, termId), {
        successTitle: "登録完了",
        successMessage: "講義を登録しました",
      });

      // 登録した講義を反映させるためのリフレッシュ
      if (register) {
        router.refresh();
      }
    });
  };

  return (
    <>
      <Card
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        bg={["white", "black"]}
        w="full"
      >
        <CardHeader>
          <HStack gap="sm">
            <Tooltip label="シラバスID" placement="top">
              <Tag variant="subtle" colorScheme="blue">
                {lecture.syllabusCode || "シラバス無"}
              </Tag>
            </Tooltip>
          </HStack>

          <Spacer />
        </CardHeader>
        <CardBody>
          <HStack w="full">
            <VStack>
              <Text fontSize="xl" fontWeight="bold">
                {lecture.name}
              </Text>

              <Text lineClamp={1}>
                <strong>担当教員:</strong>
                {lecture.instructor}
              </Text>
              <Text>
                <strong>教室:</strong> {lecture.room}
              </Text>

              <Text>
                <strong>備考:</strong> {lecture.biko}
              </Text>
            </VStack>

            <Spacer />

            {/* 既存の講義を登録 */}
            <Button
              alignSelf="end"
              onClick={() => handleRegister(lecture.id)}
              loading={isPending}
              isDisabled={isPending}
            >
              登録
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </>
  );
};

export default LectureCard;
