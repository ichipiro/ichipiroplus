"use client";

import { deleteTerm, upsertTerm } from "@/features/admin/actions/terms";
import { PencilIcon, Trash2 } from "@yamada-ui/lucide";
import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  NativeTable,
  Option,
  Select,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type TermRow = {
  id: string;
  academicYear: number;
  number: number;
  name: string;
  startDate: Date;
  endDate: Date;
};

type Props = {
  terms: TermRow[];
  currentTermId: string;
};

const formatDateInputValue = (date: Date) => {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 10);
};

const termLabelByNumber: Record<number, string> = {
  1: "第1ターム（春）",
  2: "第2ターム（夏）",
  3: "第3ターム（秋）",
  4: "第4ターム（冬）",
};

const TermsTable = ({ terms, currentTermId }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draft, setDraft] = useState<{
    academicYear: string;
    number: string;
    startDate: string;
    endDate: string;
  }>({
    academicYear: "",
    number: "1",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState<string | null>(null);

  const sortedTerms = useMemo(
    () =>
      [...terms].sort((a, b) => {
        if (a.academicYear !== b.academicYear) {
          return b.academicYear - a.academicYear;
        }
        return a.number - b.number;
      }),
    [terms],
  );

  const beginEdit = (term: TermRow) => {
    setEditingId(term.id);
    setError(null);
    setDraft({
      academicYear: String(term.academicYear),
      number: String(term.number),
      startDate: formatDateInputValue(new Date(term.startDate)),
      endDate: formatDateInputValue(new Date(term.endDate)),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = () => {
    if (!editingId) return;

    const academicYear = Number(draft.academicYear);
    const number = Number(draft.number);
    const startDate = new Date(draft.startDate);
    const endDate = new Date(draft.endDate);
    const name = `${academicYear}年度 ${termLabelByNumber[number]}`;

    setError(null);
    startTransition(async () => {
      try {
        await upsertTerm({
          academicYear,
          number,
          name,
          startDate,
          endDate,
        });
        setEditingId(null);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新に失敗しました");
      }
    });
  };

  const handleDelete = (termId: string) => {
    startTransition(async () => {
      try {
        await deleteTerm(termId);
        if (editingId === termId) {
          setEditingId(null);
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "削除に失敗しました");
      }
    });
  };

  if (sortedTerms.length === 0) {
    return (
      <Box borderWidth="1px" borderRadius="md" p={6}>
        <Text color="gray.500">学期が設定されていません。</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={3}>
      {error && (
        <Text color="danger.500" fontSize="sm">
          {error}
        </Text>
      )}
      <TableContainer w="full" opacity={isPending ? 0.7 : 1}>
        <NativeTable>
          <Thead>
            <Tr>
              <Th>年度</Th>
              <Th>ターム</Th>
              <Th>名称</Th>
              <Th>開始日</Th>
              <Th>終了日</Th>
              <Th>状態</Th>
              <Th>操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedTerms.map(term => {
              const isEditing = term.id === editingId;
              return (
                <Tr key={term.id}>
                  <Td>
                    {isEditing ? (
                      <Input
                        size="sm"
                        type="number"
                        value={draft.academicYear}
                        onChange={event =>
                          setDraft(prev => ({
                            ...prev,
                            academicYear: event.target.value,
                          }))
                        }
                        min={2000}
                        max={2100}
                      />
                    ) : (
                      `${term.academicYear}`
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <Select
                        size="sm"
                        value={draft.number}
                        onChange={value =>
                          setDraft(prev => ({ ...prev, number: String(value) }))
                        }
                      >
                        <Option value="1">第1</Option>
                        <Option value="2">第2</Option>
                        <Option value="3">第3</Option>
                        <Option value="4">第4</Option>
                      </Select>
                    ) : (
                      `第${term.number}`
                    )}
                  </Td>
                  <Td>
                    {isEditing
                      ? `${draft.academicYear}年度 ${
                          termLabelByNumber[Number(draft.number)]
                        }`
                      : term.name}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <Input
                        size="sm"
                        type="date"
                        value={draft.startDate}
                        onChange={event =>
                          setDraft(prev => ({
                            ...prev,
                            startDate: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      new Date(term.startDate).toLocaleDateString("ja-JP")
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <Input
                        size="sm"
                        type="date"
                        value={draft.endDate}
                        onChange={event =>
                          setDraft(prev => ({
                            ...prev,
                            endDate: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      new Date(term.endDate).toLocaleDateString("ja-JP")
                    )}
                  </Td>
                  <Td>
                    {term.id === currentTermId ? (
                      <Badge colorScheme="green">現在</Badge>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        -
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <HStack gap={2}>
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            colorScheme="primary"
                            onClick={saveEdit}
                            loading={isPending}
                          >
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={isPending}
                          >
                            キャンセル
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={<PencilIcon />}
                            aria-label="編集"
                            onClick={() => beginEdit(term)}
                          />
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="danger"
                            icon={<Trash2 />}
                            aria-label="削除"
                            onClick={() => handleDelete(term.id)}
                          />
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </NativeTable>
      </TableContainer>
    </VStack>
  );
};

export default TermsTable;
