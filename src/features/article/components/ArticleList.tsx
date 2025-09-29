import { Box, Grid, GridItem, Text, VStack } from "@yamada-ui/react";
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
  emptyMessage = "記事がありません",
}: ArticlesListProps) => {
  const { results: articles, count, previous } = data;

  if (articles.length === 0) {
    return (
      <VStack as="section" py={8} w="full" gap={8}>
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
      </VStack>
    );
  }

  const currentPage = previous ? Math.ceil(count / 10) : 1;
  const totalPages = Math.ceil(count / 10);

  return (
    <VStack as="section" py={8} w="full" gap={8}>
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(1, 1fr)",
        }}
        gap="md"
        w="full"
      >
        {articles.map(article => {
          return (
            <GridItem key={article.id}>
              <ArticleCard article={article} />
            </GridItem>
          );
        })}
      </Grid>

      {totalPages > 1 && (
        <ArticlePagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </VStack>
  );
};

export default ArticlesList;
