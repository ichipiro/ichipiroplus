"use client";

import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { updateTimetableVisibility } from "@/features/user/actions";
import useActionFeedback from "@/hooks/useActionFeedback";
import { Box, Switch, Text, VStack } from "@yamada-ui/react";
import { useState, useTransition } from "react";

interface DisplaySettingsProps {
  isTimetablePublic: boolean;
}

const DisplaySettings = ({ isTimetablePublic }: DisplaySettingsProps) => {
  const { withFeedback } = useActionFeedback();
  const [pendingIsPublic, setPendingIsPublic] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPublic = pendingIsPublic ?? isTimetablePublic;

  return (
    <VStack w="full" align="start" gap={4}>
      <ThemeToggleButton />

      <Box>
        <Text fontWeight="bold">時間割の公開設定</Text>
        <Text fontSize="sm" color="gray.500" mb={2}>
          有効にすると、プロフィールページで現在タームの時間割を公開します。
        </Text>
        <Switch
          checked={isPublic}
          disabled={isPending}
          onChange={() => {
            const next = !isPublic;
            setPendingIsPublic(next);
            startTransition(async () => {
              const updated = await withFeedback(
                updateTimetableVisibility(next),
                {
                  successTitle: "設定更新",
                  successMessage: next
                    ? "時間割を公開しました"
                    : "時間割を非公開にしました",
                },
              );

              if (updated !== undefined) {
                setPendingIsPublic(updated);
              } else {
                setPendingIsPublic(null);
              }
            });
          }}
          colorScheme="primary"
        >
          時間割を公開する
        </Switch>
      </Box>
    </VStack>
  );
};
export default DisplaySettings;
