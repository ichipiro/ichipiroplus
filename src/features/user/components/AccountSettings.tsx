"use client";

import {
  Box,
  Button,
  Center,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Heading,
  Text,
  useDisclosure,
} from "@yamada-ui/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteAccount } from "../actions";

const AccountSettings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteAccount();
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("アカウントの削除に失敗しました", error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Center w="full">
      <Box>
        <Heading size="md" color="danger">
          アカウントの削除
        </Heading>
        <Text mt={2} mb={4} color="gray.600">
          アカウントを削除すると、すべてのデータが完全に削除され、元に戻すことはできません。
        </Text>
        <Button colorScheme="danger" variant="outline" onClick={onOpen}>
          アカウントを削除
        </Button>
      </Box>

      <Dialog isOpen={isOpen} onClose={onClose}>
        <DialogHeader>アカウントを削除しますか？</DialogHeader>
        <DialogBody>
          この操作は取り消すことができません。すべてのデータが完全に削除されます。
        </DialogBody>
        <DialogFooter gap={3}>
          <Button ref={cancelRef} onClick={onClose} isDisabled={isDeleting}>
            キャンセル
          </Button>
          <Button
            colorScheme="danger"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
            loadingText="削除中..."
          >
            削除する
          </Button>
        </DialogFooter>
      </Dialog>
    </Center>
  );
};

export default AccountSettings;
