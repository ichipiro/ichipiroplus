import DateFormat from "@/components/DateFormat";
import { getUser } from "@/features/user/actions";
import { RefreshCwIcon } from "@yamada-ui/lucide";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@yamada-ui/react";
import Link from "next/link";
import type { Article } from "../types";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = async ({ article }: ArticleCardProps) => {
  const user = await getUser(article.userId);

  const articlePath = `/${user.username}/articles/${article.id}`;
  const authorProfilePath = `/${user.username}`;

  return (
    <Card as={LinkBox} border="1px solid" borderColor="gray.500">
      <CardHeader>
        <Heading as="h3" size="md">
          <LinkOverlay href={articlePath}>{article.title}</LinkOverlay>
        </Heading>
      </CardHeader>

      <CardBody>
        {/* 投稿日、更新日 */}
        <DateFormat
          createdAt={article.createdAt.toISOString()}
          updatedAt={article.updatedAt.toISOString()}
          createMessage="投稿日"
          updateMessage={<RefreshCwIcon />}
        />

        {/* 著者情報 */}

        <Link href={authorProfilePath}>
          <HStack gap={3} rounded="md">
            <Avatar
              name={user.displayName || ""}
              src={user.image || ""}
              size="sm"
              border="2px solid"
              borderColor={["white", "black"]}
              shadow="md"
            />
            <VStack align="start" gap="none">
              <Text fontWeight="bold" fontSize="sm">
                {user.displayName}
              </Text>

              <Text color="gray.500" fontSize="xs">
                @{user.username}
              </Text>
            </VStack>
          </HStack>
        </Link>
      </CardBody>
    </Card>
  );
};

export default ArticleCard;
