import type { UserWithRelations } from "@/features/user/types";
import { format } from "@formkit/tempo";
import { CalendarIcon, ClockIcon, FilePenIcon } from "@yamada-ui/lucide";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import Link from "next/link";
import type { Article } from "../../types";

interface ArticleViewerHeaderProps {
  article: Article;
  author: UserWithRelations;
  isAuthor: boolean;
}

const ArticleViewerHeader = ({
  article,
  author,
  isAuthor,
}: ArticleViewerHeaderProps) => {
  // 日付フォーマット
  const formattedDate = format(article.createdAt, "short", "ja");
  const formattedUpdateDate =
    article.updatedAt !== article.createdAt
      ? format(article.updatedAt, "short", "ja")
      : null;

  // 編集ページへのパス
  const editPath = `/${author.username}/articles/${article.id}/edit`;

  return (
    <VStack
      as="header"
      pb={6}
      borderBottomWidth="1px"
      borderColor="gray.200"
      w="full"
      align="start"
    >
      {isAuthor && (
        <Box alignSelf="end">
          <Link href={editPath} passHref>
            <Button startIcon={<FilePenIcon />} colorScheme="blue">
              編集する
            </Button>
          </Link>
        </Box>
      )}

      <Heading as="h1" size="2xl" alignSelf="center">
        {article.title}
      </Heading>

      {/* 著者情報とメタデータ */}
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        gap={4}
        w="full"
      >
        <HStack color="gray.600" fontSize="sm">
          <HStack>
            <CalendarIcon fontSize="16px" />
            <Text>{formattedDate} 公開</Text>
          </HStack>

          {formattedUpdateDate && (
            <HStack>
              <ClockIcon fontSize="16px" />
              <Text>{formattedUpdateDate} 更新</Text>
            </HStack>
          )}

          {!article.isPublished && (
            <Box
              px={2}
              py={1}
              bg="red.100"
              color="red.600"
              borderRadius="sm"
              fontSize="xs"
            >
              非公開
            </Box>
          )}
        </HStack>
      </Flex>
    </VStack>
  );
};

export default ArticleViewerHeader;
