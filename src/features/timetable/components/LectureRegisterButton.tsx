"use client";

import {
  registerForLecture,
  unregisterById,
} from "@/features/timetable/actions/registrations";
import useActionFeedback from "@/hooks/useActionFeedback";
import { Button } from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type LectureRegisterButtonProps = {
  lectureId: string;
  termId: string;
  isRegistered: boolean;
  registrationId?: string;
  canRegister: boolean;
};

const LectureRegisterButton = ({
  lectureId,
  termId,
  isRegistered,
  registrationId,
  canRegister,
}: LectureRegisterButtonProps) => {
  const { withFeedback } = useActionFeedback();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isRegistered) {
    return (
      <Button
        size="sm"
        colorScheme="danger"
        variant="outline"
        w="full"
        minW={0}
        loading={isPending}
        disabled={isPending || !registrationId}
        onClick={() => {
          if (!registrationId) return;

          startTransition(async () => {
            const unregistered = await withFeedback(
              unregisterById(registrationId),
              {
                successTitle: "登録解除完了",
                successMessage: "講義を時間割から削除しました",
              },
            );

            if (unregistered !== undefined) {
              router.refresh();
            }
          });
        }}
      >
        登録解除
      </Button>
    );
  }

  if (!canRegister) {
    return (
      <Button size="sm" variant="ghost" isDisabled w="full" minW={0}>
        対象外
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      colorScheme="blue"
      w="full"
      minW={0}
      loading={isPending}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const registered = await withFeedback(
            registerForLecture(lectureId, termId),
            {
              successTitle: "登録完了",
              successMessage: "講義を時間割に追加しました",
            },
          );

          if (registered) {
            router.refresh();
          }
        });
      }}
    >
      登録
    </Button>
  );
};

export default LectureRegisterButton;
