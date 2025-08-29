"use client";

import type { UserWithRelations } from "@/features/user/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import { format } from "@formkit/tempo";
import { useEditor } from "@tiptap/react";
import { SaveIcon } from "@yamada-ui/lucide";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  HStack,
  Heading,
  Input,
  Skeleton,
  Switch,
  Text,
  VStack,
} from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateArticle } from "../../actions";
import type { Article } from "../../types";
import getArticleEditorConfig from "../../utils/ArticleEditorConfig";
import ArticleEditorContent from "../ArticleEditorContent";

interface ArticleEditorProps {
  article: Article;
  user: UserWithRelations;
}

const ArticleEditor = ({ article, user }: ArticleEditorProps) => {
  const [title, setTitle] = useState(article.title);
  const [isPublic, setIsPublic] = useState(article.isPublished);
  const [isPending, startTransition] = useTransition();
  const { withFeedback } = useActionFeedback();
  const router = useRouter();

  // 記事の表示ページへのパス
  const viewPath = `/${user.username}/articles/${article.id}`;

  // 日付フォーマット
  const formattedDate = format(article.createdAt, "short", "ja");
  const formattedUpdateDate =
    article.updatedAt !== article.createdAt
      ? format(article.updatedAt, "short", "ja")
      : null;

  // エディタの設定
  const editor = useEditor(getArticleEditorConfig());

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

  // 記事を保存
  const saveArticle = () => {
    if (!editor) return;

    startTransition(async () => {
      const editorContentJSON = JSON.stringify(editor.getJSON());

      const result = await withFeedback(
        updateArticle(article.id, {
          title,
          content: editorContentJSON,
          isPublished: isPublic,
        }),
        {
          successMessage: "記事を更新しました",
          successTitle: "成功",
        },
      );

      if (result) {
        // 記事の表示ページにリダイレクト
        router.push(viewPath);
        router.refresh();
      }
    });
  };

  if (!editor) {
    return (
      <VStack w="full" align="start">
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>このページではPCでの操作が想定されています</AlertTitle>
        </Alert>

        {/* 編集ヘッダー部分のSkeleton */}
        <VStack
          as="header"
          pt={8}
          pb={6}
          borderBottomWidth="1px"
          borderColor="gray.200"
          w="full"
          align="start"
          gap={4}
        >
          {/* "記事の編集" タイトルのSkeleton */}
          <Skeleton h="32px" w="120px" />

          {/* タイトル入力フィールドのSkeleton */}
          <VStack w="full" align="start" gap={2}>
            <Skeleton h="20px" w="80px" /> {/* ラベル */}
            <Skeleton h="48px" w="full" /> {/* 入力フィールド */}
          </VStack>

          {/* スイッチとボタンのSkeleton */}
          <HStack w="full" justify="space-between">
            <HStack gap={3}>
              <Skeleton h="24px" w="100px" /> {/* 公開スイッチ */}
              <Skeleton h="16px" w="200px" /> {/* 日付テキスト */}
            </HStack>
            <Skeleton h="40px" w="80px" /> {/* 保存ボタン */}
          </HStack>
        </VStack>

        {/* エディタ本体のSkeleton */}
        <VStack w="full" gap={3}>
          <Skeleton h="40px" w="full" /> {/* ツールバー */}
          <Skeleton h="400px" w="full" /> {/* エディタコンテンツ */}
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack w="full" align="start">
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>このページではPCでの操作が想定されています</AlertTitle>
      </Alert>
      {/* 編集ヘッダー部分 */}
      <VStack
        as="header"
        pt={8}
        pb={6}
        borderBottomWidth="1px"
        borderColor="gray.200"
        w="full"
        align="start"
      >
        <Heading size="md">記事の編集</Heading>

        {/* タイトル入力 */}
        <FormControl required label="タイトル">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="タイトル"
            size="lg"
            fontSize="2xl"
            fontWeight="bold"
          />
        </FormControl>

        {/* 公開設定とアクション */}
        <HStack w="full" justify="space-between">
          <HStack>
            <Switch checked={isPublic} onChange={() => setIsPublic(!isPublic)}>
              公開する
            </Switch>
            <Text color="gray.500" fontSize="sm">
              {formattedDate}に作成
              {formattedUpdateDate && `、${formattedUpdateDate}に更新`}
            </Text>
          </HStack>

          <Button
            startIcon={<SaveIcon />}
            colorScheme="blue"
            loading={isPending}
            loadingText="保存中"
            onClick={saveArticle}
          >
            保存
          </Button>
        </HStack>
      </VStack>

      {/* エディタ本体 */}
      <ArticleEditorContent
        editor={editor}
        showTableOfContents={true}
        showBubbleMenu={true}
        isEditable={true}
      />
    </VStack>
  );
};

export default ArticleEditor;
