"use client";

import { useEditor } from "@tiptap/react";
import { Skeleton, VStack } from "@yamada-ui/react";
import { useEffect } from "react";
import type { Article } from "../../types";
import getArticleEditorConfig from "../../utils/ArticleEditorConfig";
import ArticleEditorContent from "../ArticleEditorContent";

interface ArticleViewerContentProps {
  article: Article;
}

const ArticleViewerContent = ({ article }: ArticleViewerContentProps) => {
  // 読み取り専用エディタの設定
  const editor = useEditor(
    getArticleEditorConfig({
      isEditable: false,
    }),
  );

  // 記事内容を設定
  useEffect(() => {
    if (editor && article.content) {
      try {
        const content = JSON.parse(article.content);
        editor.commands.setContent(content);
      } catch (error) {
        console.error("記事内容の解析に失敗しました:", error);
        editor.commands.setContent("<p>記事の内容を読み込めませんでした</p>");
      }
    }
  }, [editor, article.content]);

  if (!editor) {
    return (
      <VStack w="full" gap={3}>
        {/* 記事コンテンツのSkeleton */}
        <Skeleton h="24px" w="80%" />
        <Skeleton h="20px" w="full" />
        <Skeleton h="20px" w="full" />
        <Skeleton h="20px" w="90%" />
        <Skeleton h="200px" w="full" mt={4} />
        <Skeleton h="20px" w="full" />
        <Skeleton h="20px" w="95%" />
      </VStack>
    );
  }

  return <ArticleEditorContent editor={editor} showBubbleMenu={false} />;
};

export default ArticleViewerContent;
