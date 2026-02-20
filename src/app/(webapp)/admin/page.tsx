import { checkAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  Bell,
  Calendar,
  CalendarIcon,
  FileJson,
  FileJsonIcon,
  Users,
  UsersIcon,
} from "@yamada-ui/lucide";
import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  HStack,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "管理者ダッシュボード",
  description: "システム管理者用ダッシュボード",
};

async function getStats() {
  const [userCount, lectureCount, taskCount] = await Promise.all([
    prisma.user.count(),
    prisma.lecture.count(),
    prisma.task.count(),
  ]);

  return {
    users: userCount,
    lectures: lectureCount,
    tasks: taskCount,
  };
}

export default async function AdminDashboard() {
  // 管理者権限チェック
  await checkAdminAccess();

  const stats = await getStats();

  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading as="h1" size="lg" mb={2}>
          管理者ダッシュボード
        </Heading>
        <Text color="gray.600">システムの状態と管理機能へのアクセス</Text>
      </Box>

      {/* 統計情報 */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
        <Card>
          <CardBody>
            <HStack mb={2}>
              <UsersIcon fontSize="sm" />
              <Text fontSize="sm" fontWeight="bold">
                ユーザー数
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {stats.users.toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.600">
              登録済みユーザー
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack mb={2}>
              <CalendarIcon fontSize="sm" />
              <Text fontSize="sm" fontWeight="bold">
                講義数
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {stats.lectures.toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.600">
              登録済み講義
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack mb={2}>
              <FileJsonIcon fontSize="sm" />
              <Text fontSize="sm" fontWeight="bold">
                タスク数
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {stats.tasks.toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.600">
              作成済みタスク
            </Text>
          </CardBody>
        </Card>
      </Grid>

      {/* クイックアクション */}
      <Box>
        <Heading as="h2" size="md" mb={4}>
          クイックアクション
        </Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
          <Link href="/admin/lecture-import">
            <Card
              cursor="pointer"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <FileJson size="lg" color="blue.500" />
                    <Heading size="sm">講義データインポート</Heading>
                  </HStack>
                  <Badge colorScheme="blue">重要</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.600">
                  スクレイパーで生成したJSONファイルから講義データをインポート
                </Text>
              </CardBody>
            </Card>
          </Link>

          <Link href="/admin/notifications">
            <Card
              cursor="pointer"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <Bell size="lg" color="purple.500" />
                    <Heading size="sm">プッシュ通知管理</Heading>
                  </HStack>
                  <Badge colorScheme="purple">新機能</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.600">
                  ユーザーへのプッシュ通知送信と通知履歴の管理
                </Text>
              </CardBody>
            </Card>
          </Link>

          <Link href="/admin/terms">
            <Card
              cursor="pointer"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <Calendar size="lg" color="orange.500" />
                    <Heading size="sm">学期管理</Heading>
                  </HStack>
                  <Badge colorScheme="orange">重要</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.600">
                  学期・ターム期間の設定と現在の学期の管理
                </Text>
              </CardBody>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card
              cursor="pointer"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <Users size="lg" color="green.500" />
                    <Heading size="sm">ユーザー管理</Heading>
                  </HStack>
                  <Badge colorScheme="green">準備中</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.600">
                  ユーザーの一覧表示、権限管理、プロフィール編集
                </Text>
              </CardBody>
            </Card>
          </Link>
        </Grid>
      </Box>

      {/* システム情報 */}
      <Card>
        <CardHeader>
          <Heading size="sm">システム情報</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" gap={2} fontSize="sm">
            <HStack justify="space-between">
              <Text color="gray.600">環境:</Text>
              <Badge>{process.env.NODE_ENV}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">データベース:</Text>
              <Badge colorScheme="green">接続中</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">最終更新:</Text>
              <Text>{new Date().toLocaleString("ja-JP")}</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
