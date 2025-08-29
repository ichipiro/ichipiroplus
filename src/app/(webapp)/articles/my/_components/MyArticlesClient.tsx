"use client";

import { deleteArticle, getMyArticles } from "@/features/article/actions";
import type { Article } from "@/features/article/types";
import { FilePenIcon, Trash2Icon } from "@yamada-ui/lucide";
import {
  Button,
  HStack,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NativeTable,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from "@yamada-ui/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

interface MyArticlesClientProps {
  articles: Article[];
  profileId: string;
}

const MyArticlesClient = ({
  articles: initialArticles,
  profileId,
}: MyArticlesClientProps) => {
  const { data: articles = initialArticles, mutate } = useSWR<Article[]>(
    ["my-articles"],
    () => getMyArticles(),
    {
      fallbackData: initialArticles,
    },
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleDelete = async (article: Article) => {
    setSelectedArticle(article);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!selectedArticle) return;
    try {
      await deleteArticle(selectedArticle.id);
      await mutate(
        articles.filter(article => article.id !== selectedArticle.id),
      );
      onClose();
    } catch (error) {
      console.error("記事の削除に失敗しました", error);
    }
  };

  return (
    <VStack>
      <Heading size="lg">マイ記事</Heading>

      <TableContainer w="full">
        <NativeTable withColumnBorders withBorder>
          <Thead>
            <Tr>
              <Th>タイトル</Th>
              <Th>更新日</Th>
              <Th>公開状態</Th>
              <Th>操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {articles.map(article => (
              <Tr key={article.id}>
                <Td>
                  <Link href={`/${profileId}/articles/${article.id}`}>
                    <Heading size="md" className="hover:underline">
                      {article.title}
                    </Heading>
                  </Link>
                </Td>

                <Td>
                  {format(new Date(article.updatedAt), "yyyy/MM/dd", {
                    locale: ja,
                  })}
                </Td>
                <Td>
                  <Text color={article.isPublished ? "green.500" : "red.500"}>
                    {article.isPublished ? "公開" : "非公開"}
                  </Text>
                </Td>
                <Td>
                  <HStack>
                    <Link href={`/${profileId}/articles/${article.id}/edit`}>
                      <IconButton
                        icon={<FilePenIcon className="w-5 h-5" />}
                        variant="ghost"
                        colorScheme="primary"
                      />
                    </Link>

                    <IconButton
                      icon={<Trash2Icon className="w-5 h-5" />}
                      onClick={() => handleDelete(article)}
                      variant="ghost"
                      colorScheme="danger"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </NativeTable>
      </TableContainer>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalHeader>記事を削除しますか？</ModalHeader>

        <ModalBody>
          <Text>
            この操作は取り消すことができません。記事「{selectedArticle?.title}
            」が完全に削除されます。
          </Text>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={onClose}>キャンセル</Button>
            <Button colorScheme="danger" onClick={confirmDelete}>
              削除する
            </Button>
          </HStack>
        </ModalFooter>
      </Modal>
    </VStack>
  );
};

export default MyArticlesClient;
