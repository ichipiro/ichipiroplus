"use client";

import { copyTimetableFromUser } from "@/features/timetable/actions/sharing";
import useActionFeedback from "@/hooks/useActionFeedback";
import { Button } from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type CopyTimetableButtonProps = {
  sourceUserId: string;
  sourceDisplayName: string;
  termId: string;
};

const CopyTimetableButton = ({
  sourceUserId,
  sourceDisplayName,
  termId,
}: CopyTimetableButtonProps) => {
  const router = useRouter();
  const { withFeedback } = useActionFeedback();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      colorScheme="blue"
      loading={isPending}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await withFeedback(
            copyTimetableFromUser(sourceUserId, termId),
            {
              successTitle: "コピー完了",
              successMessage: data =>
                `${sourceDisplayName}の時間割をコピーしました（追加: ${data.created}件 / 上書き: ${data.updated}件）`,
            },
          );

          if (result) {
            router.refresh();
          }
        });
      }}
    >
      時間割をコピー
    </Button>
  );
};

export default CopyTimetableButton;
