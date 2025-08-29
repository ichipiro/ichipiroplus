import { getUsers } from "@/features/user/actions";
import type { UserWithRelations } from "@/features/user/types";
import { Box, Grid, GridItem, Heading, Text, VStack } from "@yamada-ui/react";
import type { Article, PaginatedResponse } from "../types";
import ArticleCard from "./ArticleCard";
import ArticlePagination from "./ArticlePagination";

interface ArticlesListProps {
  data: PaginatedResponse<Article>;
  title?: string;
  emptyMessage?: string;
}

const ArticlesList = async ({
  data,
  title = "",
  emptyMessage = "記事がありません",
}: ArticlesListProps) => {
  const { results: articles, count, previous } = data;
  const currentPage = previous ? Math.ceil(count / 10) : 1;
  const totalPages = Math.ceil(count / 10);

  // ユーザーIDを抽出して一括取得
  const userIds = Array.from(
    new Set(articles.map((article) => article.userId))
  );
  const usersMap: Map<string, UserWithRelations> = await getUsers(userIds);

  return (
    <VStack as="section" py={8} w="full" gap={8}>
      {title && (
        <Heading as="h2" size="lg">
          {title}
        </Heading>
      )}

      {articles.length > 0 ? (
        <>
          <Grid
            templateColumns={{
              base: "repeat(2, 1fr)",
              md: "repeat(1, 1fr)",
            }}
            gap="md"
            w="full"
          >
            {articles.map((article) => {
              const user = usersMap.get(article.userId);
              return (
                user && (
                  <GridItem key={article.id}>
                    <ArticleCard article={article} user={user} />
                  </GridItem>
                )
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <ArticlePagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </>
      ) : (
        <Box
          py={12}
          textAlign="center"
          bg="gray.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Text color="gray.500">{emptyMessage}</Text>
        </Box>
      )}
    </VStack>
  );
};

export default ArticlesList;
