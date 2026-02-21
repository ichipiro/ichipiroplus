"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  HStack,
  Heading,
  Input,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@yamada-ui/react";
import { useState } from "react";
import { useNotification } from "../hooks/useNotification";

/**
 * 通知設定コンポーネント
 */
export default function NotificationSettings() {
  // 通知フックを使用
  const {
    isSupported,
    isLoading,
    isProcessing,
    permission,
    isSubscribed,
    settings,
    toggleNotifications,
    updateSettings,
    sendTestNotifications,
    showLocalNotification,
  } = useNotification();

  // テスト通知用の状態
  const [testTitle, setTestTitle] = useState("テスト通知");
  const [testBody, setTestBody] = useState("これはテスト通知です");

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
    {
      id: "system-notices",
      key: "systemNotices" as const,
      label: "システム通知",
      helperMessage: "メンテナンス情報や重要なお知らせを受け取ります",
    },
  ];

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text mt={4}>通知設定を読み込んでいます...</Text>
      </Box>
    );
  }

  return (
    <VStack align="start" w="full" gap={6}>
      <Heading size="lg">通知設定</Heading>

      {!isSupported ? (
        <Alert status="warning">
          <AlertIcon />
          <AlertDescription>
            お使いのブラウザはプッシュ通知をサポートしていません。
          </AlertDescription>
        </Alert>
      ) : permission === "denied" ? (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            通知がブラウザでブロックされています。ブラウザの設定から通知を許可してください。
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs variant="enclosed" w="full">
          <TabList>
            <Tab>通知設定</Tab>
            <Tab>テスト</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="start" gap={6} w="full">
                <Card w="full">
                  <CardHeader>
                    <HStack justifyContent="space-between" w="full">
                      <Heading size="sm">プッシュ通知</Heading>
                      <Badge colorScheme={isSubscribed ? "green" : "gray"}>
                        {isSubscribed ? "有効" : "無効"}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" gap={4}>
                      <FormControl
                        label="通知配信"
                        helperMessage="講義・タスク・システム通知をまとめて有効化します"
                      >
                        <HStack justifyContent="flex-end">
                          <Switch
                            id="push-notifications"
                            checked={isSubscribed}
                            onChange={() => toggleNotifications()}
                            disabled={isProcessing}
                            colorScheme="primary"
                          />
                        </HStack>
                      </FormControl>

                      {!isSubscribed && (
                        <Alert status="info">
                          <AlertIcon />
                          <AlertDescription>
                            先に通知配信をオンにすると、個別の通知種別を設定できます。
                          </AlertDescription>
                        </Alert>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {permission === "default" && !isSubscribed && (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>
                      通知を有効にすると、ブラウザから許可を求められます。
                    </AlertDescription>
                  </Alert>
                )}

                <Card w="full">
                  <CardHeader>
                    <Heading size="sm">通知を受け取る項目</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" gap={4}>
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
                              disabled={
                                !isSubscribed || !settings || isProcessing
                              }
                              colorScheme="primary"
                            />
                          </HStack>
                        </FormControl>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {isSubscribed && (
                  <Box alignSelf="flex-end">
                    <Button
                      variant="outline"
                      colorScheme="danger"
                      size="sm"
                      onClick={() => toggleNotifications()}
                      loading={isProcessing}
                      loadingText="処理中..."
                    >
                      すべての通知をオフにする
                    </Button>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="start" gap={6} w="full">
                <Card w="full">
                  <CardHeader>
                    <Heading size="sm">通知テスト</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" gap={4}>
                      <FormControl label="通知タイトル">
                        <Input
                          value={testTitle}
                          onChange={e => setTestTitle(e.target.value)}
                          placeholder="テスト通知"
                        />
                      </FormControl>

                      <FormControl label="通知メッセージ">
                        <Input
                          value={testBody}
                          onChange={e => setTestBody(e.target.value)}
                          placeholder="これはテスト通知です"
                        />
                      </FormControl>

                      <HStack gap={4} w="full" justify="flex-end" pt={2}>
                        <Button
                          onClick={() =>
                            showLocalNotification(testTitle, testBody)
                          }
                          colorScheme="primary"
                          variant="outline"
                          disabled={permission !== "granted" || isProcessing}
                          loading={isProcessing}
                        >
                          ローカル通知を表示
                        </Button>

                        <Button
                          onClick={() =>
                            sendTestNotifications(testTitle, testBody)
                          }
                          colorScheme="primary"
                          disabled={!isSubscribed || isProcessing}
                          loading={isProcessing}
                        >
                          サーバーから通知を送信
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </VStack>
  );
}
