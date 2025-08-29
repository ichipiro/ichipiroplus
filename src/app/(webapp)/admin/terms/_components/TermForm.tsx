"use client";

import { upsertTerm } from "@/features/admin/actions/terms";
import { DatePicker } from "@yamada-ui/calendar";
import { Plus } from "@yamada-ui/lucide";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  HStack,
  Input,
  Select,
  type SelectItem,
  Tag,
  VStack,
} from "@yamada-ui/react";
import { useState } from "react";

export default function TermForm() {
  const [state, setState] = useState<{
    success: boolean;
    error: string | null;
  }>({ success: false, error: null });
  const [isPending, setIsPending] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("1");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setState({ success: false, error: null });

    const formData = new FormData(event.currentTarget);
    const yearValue = formData.get("year");
    const startDateValue = formData.get("startDate");
    const endDateValue = formData.get("endDate");

    console.log("Form values:", {
      yearValue,
      selectedTerm,
      startDateValue,
      endDateValue,
    });

    const year = Number(yearValue);
    const number = Number(selectedTerm);
    const startDate = new Date(startDateValue as string);
    const endDate = new Date(endDateValue as string);

    const termNames = {
      1: "第1ターム（春）",
      2: "第2ターム（夏）",
      3: "第3ターム（秋）",
      4: "第4ターム（冬）",
    };

    const name = `${year}年度 ${termNames[number as keyof typeof termNames]}`;

    try {
      await upsertTerm({
        year,
        number,
        name,
        startDate,
        endDate,
      });

      setState({ success: true, error: null });
      // フォームをリセット
      event.currentTarget.reset();
      setSelectedTerm("1");
    } catch (error) {
      setState({
        success: false,
        error: error instanceof Error ? error.message : "エラーが発生しました",
      });
    } finally {
      setIsPending(false);
    }
  };

  const termItems: SelectItem[] = [
    { label: "第1ターム（春）", value: "1" },
    { label: "第2ターム（夏）", value: "2" },
    { label: "第3ターム（秋）", value: "3" },
    { label: "第4ターム（冬）", value: "4" },
  ];

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg={["white", "black"]}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      shadow="sm"
    >
      <VStack gap={4}>
        {/* エラー表示 */}
        {state.error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* 成功メッセージ */}
        {state.success && (
          <Alert status="success">
            <AlertIcon />
            <AlertDescription>学期を作成しました</AlertDescription>
          </Alert>
        )}

        {/* ヘッダー */}
        <Box w="full" borderBottomWidth="1px" pb={3}>
          <Plus size="sm" style={{ display: "inline", marginRight: "8px" }} />
          <span style={{ fontWeight: "bold" }}>新しい学期を追加</span>
        </Box>

        <HStack>
          {/* 年度 */}
          <FormControl
            label="年度"
            required
            requiredIndicator={
              <Tag size="sm" colorScheme="danger" ms={2}>
                必須
              </Tag>
            }
          >
            <Input
              name="year"
              type="number"
              placeholder="2024"
              min={2020}
              max={2100}
              defaultValue={new Date().getFullYear()}
              required
            />
          </FormControl>

          {/* ターム */}
          <FormControl
            label="ターム"
            required
            requiredIndicator={
              <Tag size="sm" colorScheme="danger" ms={2}>
                必須
              </Tag>
            }
          >
            <Select
              placeholder="ターム番号を選択"
              items={termItems}
              value={selectedTerm}
              onChange={value => setSelectedTerm(value as string)}
              required
            />
          </FormControl>
        </HStack>

        <HStack>
          {/* 開始日 */}
          <FormControl
            label="開始日"
            required
            requiredIndicator={
              <Tag size="sm" colorScheme="danger" ms={2}>
                必須
              </Tag>
            }
          >
            <DatePicker name="startDate" placeholder="YYYY/MM/DD" required />
          </FormControl>

          {/* 終了日 */}
          <FormControl
            label="終了日"
            required
            requiredIndicator={
              <Tag size="sm" colorScheme="danger" ms={2}>
                必須
              </Tag>
            }
          >
            <DatePicker name="endDate" placeholder="YYYY/MM/DD" required />
          </FormControl>
        </HStack>
        {/* 送信ボタン */}
        <Button type="submit" colorScheme="blue" w="full" loading={isPending}>
          学期を作成
        </Button>
      </VStack>
    </Box>
  );
}
