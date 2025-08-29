"use client";

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    // エラーログ出力（開発時のデバッグ用）
    console.error("Error caught by error.tsx:", error);
  }, [error]);

  // 401 Unauthorized - ログインページへリダイレクト
  if (error instanceof UnauthorizedError) {
    redirect("/login");
  }

  // 404 Not Found - 専用ページ
  if (error instanceof NotFoundError) {
    return (
      <Center minH="100vh" p={6}>
        <Card maxW="md" w="full">
          <CardHeader textAlign="center">
            <Heading size="xl" color="gray.600">
              404
            </Heading>
            <Text fontSize="lg" mt={2}>
              ページが見つかりません
            </Text>
          </CardHeader>
          <CardBody textAlign="center">
            <Text color="gray.500" mb={6}>
              {error.message}
            </Text>
            <VStack>
              <Button colorScheme="blue">
                <Link href={"/"}>ホームに戻る</Link>
              </Button>
              <Button variant="ghost" onClick={reset}>
                再試行
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  // 400 Bad Request - バリデーションエラー
  if (error instanceof BadRequestError) {
    return (
      <Center minH="100vh" p={6}>
        <Card maxW="md" w="full">
          <CardHeader textAlign="center">
            <Heading size="xl" color="orange.500">
              入力エラー
            </Heading>
          </CardHeader>
          <CardBody textAlign="center">
            <Text color="gray.600" mb={6}>
              {error.message}
            </Text>
            <VStack>
              <Button onClick={reset} colorScheme="orange">
                やり直す
              </Button>
              <Button variant="ghost" onClick={() => window.history.back()}>
                戻る
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  // その他のエラー（500など）- 汎用エラーページ
  return (
    <Center minH="100vh" p={6}>
      <Card maxW="md" w="full">
        <CardHeader textAlign="center">
          <Heading size="xl" color="red.500">
            エラーが発生しました
          </Heading>
        </CardHeader>
        <CardBody textAlign="center">
          <Text color="gray.600" mb={6}>
            申し訳ございません。予期しないエラーが発生しました。
            {process.env.NODE_ENV === "development" && (
              <Text mt={2} fontSize="sm" color="gray.500">
                {error.message}
              </Text>
            )}
          </Text>
          <VStack>
            <Button onClick={reset} colorScheme="red">
              再試行
            </Button>
            <Button variant="ghost">
              <Link href={"/"}>ホームに戻る</Link>
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Center>
  );
};

export default ErrorPage;
