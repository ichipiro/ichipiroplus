"use client";

import { useNotification } from "@/features/webpush/hooks/useNotification";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  Heading,
  HStack,
  Switch,
  Text,
  VStack,
} from "@yamada-ui/react";
import { useRouter } from "next/navigation";

interface StepNotificationProps {
  onStepPrev: () => void;
}

const StepNotification = ({ onStepPrev }: StepNotificationProps) => {
  const router = useRouter();
  const {
    isSupported,
    isLoading,
    isProcessing,
    permission,
    isSubscribed,
    settings,
    toggleNotifications,
    updateSettings,
  } = useNotification();

  const finishRegistration = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const notificationItems = [
    {
      id: "lecture-starts",
      key: "lectureStarts" as const,
      label: "講義開始通知",
      helperMessage: "登録済み講義の開始時刻に通知を受け取ります",
    },
    {
      id: "task-reminders",
      key: "taskReminders" as const,
      label: "タスク通知",
      helperMessage: "タスクの期限に関する通知を受け取ります",
    },
  ];

  return (
    <Card
      variant="outline"
      bg={["white", "black"]}
      p="md"
      w={{ base: "4xl", md: "sm" }}
    >
      <CardHeader>
        <Heading size="xl">通知設定</Heading>
      </CardHeader>

      <CardBody>
        <VStack align="stretch" gap={5}>
          <Text>
            講義の開始やタスク期限を見逃しにくくするために、プッシュ通知を設定できます。後から設定画面でも変更できます。
          </Text>

          {isLoading ? (
            <Text color="gray.500">通知設定を読み込んでいます...</Text>
          ) : !isSupported ? (
            <Alert status="warning">
              <AlertIcon />
              <AlertDescription>
                お使いのブラウザはプッシュ通知をサポートしていません。後から対応ブラウザで設定できます。
              </AlertDescription>
            </Alert>
          ) : permission === "denied" ? (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                ブラウザで通知がブロックされています。ブラウザ設定から許可すると利用できます。
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Box
                borderWidth="1px"
                borderRadius="md"
                px={4}
                py={4}
                bg={isSubscribed ? "primary.50" : undefined}
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack align="start" gap={1}>
                    <Heading size="sm">プッシュ通知</Heading>
                    <Text fontSize="sm" color="gray.600">
                      講義通知とタスク通知をまとめて有効化します
                    </Text>
                  </VStack>
                  <Switch
                    id="register-push-notifications"
                    checked={isSubscribed}
                    onChange={() =>
                      toggleNotifications({
                        lectureStarts: true,
                        taskReminders: true,
                        systemNotices: false,
                      })
                    }
                    disabled={isProcessing}
                    colorScheme="primary"
                  />
                </HStack>
              </Box>

              {permission === "default" && !isSubscribed && (
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    有効にするとブラウザから通知許可を求められます。
                  </AlertDescription>
                </Alert>
              )}

              <Box borderWidth="1px" borderRadius="md" px={4} py={4}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm">受け取る通知</Heading>
                  {notificationItems.map(item => (
                    <FormControl
                      key={item.id}
                      label={item.label}
                      helperMessage={item.helperMessage}
                    >
                      <HStack justifyContent="flex-end">
                        <Switch
                          id={item.id}
                          checked={Boolean(settings?.[item.key])}
                          onChange={() => {
                            if (!settings) return;
                            updateSettings({
                              [item.key]: !settings[item.key],
                            });
                          }}
                          disabled={!isSubscribed || !settings || isProcessing}
                          colorScheme="primary"
                        />
                      </HStack>
                    </FormControl>
                  ))}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      </CardBody>

      <CardFooter>
        <HStack justifyContent="space-between" w="full">
          <Button variant="ghost" onClick={onStepPrev}>
            戻る
          </Button>
          <Button colorScheme="primary" onClick={finishRegistration}>
            ダッシュボードへ
          </Button>
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default StepNotification;
