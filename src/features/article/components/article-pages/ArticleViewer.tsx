"use client";

import type { UserWithRelations } from "@/features/user/types";
import { VStack } from "@yamada-ui/react";
import type { Article } from "../../types";
import ArticleViewerContent from "./ArticleViewerContent";
import ArticleViewerHeader from "./ArticleViewerHeader";

interface ArticleViewerProps {
  article: Article;
  author: UserWithRelations;
  isAuthor: boolean;
}

const ArticleViewer = ({ article, isAuthor, author }: ArticleViewerProps) => {
  return (
    <VStack w="full" align="start">
      <ArticleViewerHeader
        article={article}
        author={author}
        isAuthor={isAuthor}
      />
      <ArticleViewerContent article={article} />
    </VStack>
  );
};

export default ArticleViewer;
