"use client";

import type { Lecture } from "@/features/timetable/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  Heading,
  Separator,
  Text,
  VStack,
  useDisclosure,
} from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { unregisterById } from "../actions";

interface SettingsTabProps {
  lecture: Lecture;
  registrationId: string;
}

const LectureSettingsTab = ({ lecture, registrationId }: SettingsTabProps) => {
  const { open, onOpen, onClose } = useDisclosure();

  const router = useRouter();
  const { withFeedback } = useActionFeedback();
  const [isPending, startTransition] = useTransition();

  // 講義登録を削除
  const handleDeleteRegistration = () => {
    startTransition(async () => {
      await withFeedback(unregisterById(registrationId), {
        successMessage: "講義の登録を削除しました",
        successTitle: "登録削除",
      });

      router.refresh();
    });
  };

  return (
    <VStack align="start" w="full">
      <Box w="full">
        <Heading size="md" mb={4}>
          登録設定
        </Heading>
        <Text mb={6}>この講義の登録に関する設定を行います。</Text>

        <Separator mb={6} />

        <Box
          p={4}
          borderWidth="1px"
          borderColor="red.200"
          borderRadius="md"
          bg={["red.50", "red.800"]}
        >
          <Heading size="sm" color={["red.600", "red.50"]} mb={2}>
            講義の登録を削除
          </Heading>
          <Text mb={4}>
            この講義の登録を削除します。関連するタスクもすべて削除されます。この操作は元に戻せません。
          </Text>
          <Button colorScheme="red" size="sm" onClick={onOpen}>
            登録を削除
          </Button>
        </Box>
      </Box>

      {/* 確認ダイアログ */}
      <Dialog open={open} onClose={onClose}>
        <DialogOverlay />

        <DialogBody>
          <DialogHeader>講義登録の削除</DialogHeader>

          <Text>
            「{lecture.name}」の登録を削除しますか？この操作は元に戻せません。
          </Text>

          <DialogFooter>
            <Button onClick={onClose}>キャンセル</Button>
            <Button
              colorScheme="red"
              ml={3}
              loading={isPending}
              onClick={async () => {
                await handleDeleteRegistration();
                onClose();
              }}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogBody>
      </Dialog>
    </VStack>
  );
};

export default LectureSettingsTab;
