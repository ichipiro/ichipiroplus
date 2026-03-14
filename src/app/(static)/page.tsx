import { auth } from "@/lib/auth";
import {
  CalendarIcon,
  CircleCheckIcon,
  ClipboardPenIcon,
} from "@yamada-ui/lucide";
import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import Link from "next/link";

const Home = async () => {
  const session = await auth();

  return (
    <VStack gap={12} align="center">
      <VStack gap={6} textAlign="center" maxW="3xl" px={4}>
        <Heading size="2xl" as="h1">
          Ichipiro+へようこそ
        </Heading>
        <Text fontSize="xl" color="gray.600" _dark={{ color: "gray.300" }}>
          時間割管理、タスク管理、記事作成・共有が一つにまとまった
          <br />
          広島市立大学生活をサポートする非公式プラットフォーム
        </Text>

        {session?.user ? (
          <Link href="/dashboard" passHref>
            <Button size="lg" colorScheme="blue">
              ダッシュボードに移動
            </Button>
          </Link>
        ) : (
          <Link href="/auth/login" passHref>
            <Button size="lg" colorScheme="blue">
              ログイン
            </Button>
          </Link>
        )}
      </VStack>

      <Box w="full" maxW="5xl" px={4}>
        <VStack gap={16}>
          <Heading as="h2" size="xl" textAlign="center">
            主な機能
          </Heading>

          <HStack
            w="full"
            gap={8}
            align="center"
            flexDir={{ base: "column", md: "row" }}
          >
            <Center
              borderRadius="full"
              bg="blue.50"
              p={6}
              _dark={{ bg: "blue.900" }}
            >
              <CalendarIcon size="80px" color="blue.500" />
            </Center>
            <VStack align="start" flex={1} gap={4}>
              <Heading as="h3" size="lg">
                時間割管理
              </Heading>
              <Text fontSize="lg">
                シンプルで使いやすい時間割管理機能で、あなたの授業スケジュールを簡単に整理できます。授業情報を登録して、いつでも確認できます。
              </Text>
            </VStack>
          </HStack>

          <HStack
            w="full"
            gap={8}
            align="center"
            flexDir={{ base: "column", md: "row-reverse" }}
          >
            <Center
              borderRadius="full"
              bg="green.50"
              p={6}
              _dark={{ bg: "green.900" }}
            >
              <CircleCheckIcon size="80px" color="green.500" />
            </Center>
            <VStack align="start" flex={1} gap={4}>
              <Heading as="h3" size="lg">
                タスク管理
              </Heading>
              <Text fontSize="lg">
                講義ごとのタスクを管理し、効率的に学習を進めましょう。締め切りを一目で確認できます。
              </Text>
            </VStack>
          </HStack>

          <HStack
            w="full"
            gap={8}
            align="center"
            flexDir={{ base: "column", md: "row" }}
          >
            <Center
              borderRadius="full"
              bg="purple.50"
              p={6}
              _dark={{ bg: "purple.900" }}
            >
              <ClipboardPenIcon size="80px" color="purple.500" />
            </Center>
            <VStack align="start" flex={1} gap={4}>
              <Heading as="h3" size="lg">
                記事作成・共有
              </Heading>
              <Text fontSize="lg">
                大学生活に関する事から些細なことまで記事として保存・共有できます。リッチなエディタで効果的に情報をまとめ、学生同士で情報を共有しましょう。
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      <VStack gap={6} py={10} textAlign="center" maxW="3xl" px={4}>
        <Heading as="h2" size="xl">
          始めましょう
        </Heading>
        <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
          Ichipiro+で学生生活をより効率的に、より充実したものにしましょう。
        </Text>
        {session?.user ? (
          <Link href="/dashboard" passHref>
            <Button size="lg" colorScheme="blue">
              ダッシュボードに移動
            </Button>
          </Link>
        ) : (
          <Link href="/auth/login" passHref>
            <Button size="lg" colorScheme="blue">
              今すぐログイン
            </Button>
          </Link>
        )}
      </VStack>
    </VStack>
  );
};

export default Home;
