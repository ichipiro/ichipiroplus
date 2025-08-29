"use client";
import useActionFeedback from "@/hooks/useActionFeedback";
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
  VStack,
} from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createArticle } from "../../actions";
import getArticleEditorConfig from "../../utils/ArticleEditorConfig";
import ArticleEditorContent from "../ArticleEditorContent";

interface ArticleCreatorProps {
  username: string;
}

const ArticleCreator = ({ username }: ArticleCreatorProps) => {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { withFeedback, showError } = useActionFeedback();
  const router = useRouter();

  // エディタの設定
  const editor = useEditor(
    getArticleEditorConfig({
      content: "",
    }),
  );

  // 新しい記事を保存
  const saveArticle = () => {
    if (!editor || !title.trim()) {
      showError(new Error("タイトルを入力してください"));
      return;
    }

    startTransition(async () => {
      const editorContentJSON = JSON.stringify(editor.getJSON());

      const result = await withFeedback(
        createArticle({
          title: title.trim(),
          content: editorContentJSON,
          isPublished: isPublic,
        }),
        {
          successMessage: "記事を作成しました",
        },
      );

      if (result) {
        // 作成した記事の表示ページにリダイレクト
        router.push(`/${username}/articles/${result.id}`);
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

        {/* ヘッダー部分のSkeleton */}
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
          {/* "新しい記事を作成" タイトルのSkeleton */}
          <Skeleton h="36px" w="200px" />

          {/* タイトル入力フィールドのSkeleton */}
          <VStack w="full" align="start" gap={2}>
            <Skeleton h="20px" w="80px" /> {/* ラベル */}
            <Skeleton h="48px" w="full" /> {/* 入力フィールド */}
          </VStack>

          {/* スイッチとボタンのSkeleton */}
          <HStack w="full" justify="space-between">
            <Skeleton h="24px" w="100px" /> {/* 公開スイッチ */}
            <Skeleton h="40px" w="80px" /> {/* 作成ボタン */}
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
      {/* ヘッダー部分 */}
      <VStack
        as="header"
        pt={8}
        pb={6}
        borderBottomWidth="1px"
        borderColor="gray.200"
        w="full"
        align="start"
      >
        <Heading size="lg">新しい記事を作成</Heading>

        {/* タイトル入力 */}
        <FormControl label="タイトル" required>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="タイトルを入力してください"
            size="lg"
            fontSize="2xl"
            fontWeight="bold"
            disabled={isPending}
          />
        </FormControl>

        {/* 公開設定とアクション */}
        <HStack w="full" justify="space-between">
          <Switch
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            disabled={isPending}
          >
            公開する
          </Switch>

          <Button
            startIcon={<SaveIcon />}
            colorScheme="blue"
            loading={isPending}
            loadingText="作成中"
            onClick={saveArticle}
          >
            作成
          </Button>
        </HStack>
      </VStack>

      {/* エディタ本体 */}
      <ArticleEditorContent
        editor={editor}
        showTableOfContents={true}
        showBubbleMenu={true}
        isEditable={!isPending}
      />
    </VStack>
  );
};

export default ArticleCreator;
