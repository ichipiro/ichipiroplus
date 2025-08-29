"use client";

import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@yamada-ui/react";
import { useState } from "react";

interface DeleteCompletedTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
  taskCount: number;
}

const DeleteCompletedTasksDialog = ({
  isOpen,
  onClose,
  onDelete,
  taskCount,
}: DeleteCompletedTasksDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete();
      if (success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        <DialogHeader>完了タスクの一括削除</DialogHeader>

        <Text>
          完了したタスク({taskCount}
          件)をすべて削除しますか？この操作は取り消せません。
        </Text>

        <DialogFooter>
          <Button onClick={onClose}>キャンセル</Button>
          <Button
            colorScheme="red"
            loading={isDeleting}
            onClick={handleConfirmDelete}
            ml={3}
          >
            すべて削除
          </Button>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  );
};

export default DeleteCompletedTasksDialog;
