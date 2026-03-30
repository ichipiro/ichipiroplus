import { HStack, Heading, Link, Text, VStack } from "@yamada-ui/react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <VStack as="footer" py="md" px={{ base: "lg", md: "md" }} mt="lg" w="full">
      <HStack
        w="full"
        minW={0}
        justify="space-between"
        align="start"
        wrap="wrap"
      >
        <HStack>
          <VStack gap="xs">
            <Text>
              <Heading as="span" size="2xl" fontFamily="sans-serif">
                I
              </Heading>
              <Heading as="span" size="2xl">
                chipiro+
              </Heading>
            </Text>
            <Text>大学生活をスマートに管理</Text>
          </VStack>
        </HStack>

        <VStack align="center" maxW="6xl" mx="auto" minW={0}>
          <HStack fontSize="sm" color="gray.600" flexWrap="wrap">
            <Link href="/" _hover={{ color: "blue.500" }}>
              ホーム
            </Link>
            <Link href="/timetable" _hover={{ color: "blue.500" }}>
              時間割
            </Link>
            <Link href="/articles" _hover={{ color: "blue.500" }}>
              記事
            </Link>
            <Link href="/settings" _hover={{ color: "blue.500" }}>
              設定
            </Link>
            <Link href="/privacy" _hover={{ color: "blue.500" }}>
              プライバシーポリシー
            </Link>
            <Link href="/terms" _hover={{ color: "blue.500" }}>
              利用規約
            </Link>
          </HStack>
        </VStack>
      </HStack>

      <Text fontSize="xs" color="gray.500" align="center">
        © {currentYear} いちぴろ・エクスプローラ. All rights reserved.
      </Text>
    </VStack>
  );
};

export default Footer;
