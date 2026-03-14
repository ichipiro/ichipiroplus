"use client";

import { DAYS, DAY_LABELS, TIMES } from "@/features/timetable/constant";
import { Button, Flex, HStack, Input, Option, Select } from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialQ?: string;
  initialDay?: number;
  initialTime?: number;
};

const LectureFilters = ({ initialQ, initialDay, initialTime }: Props) => {
  const router = useRouter();
  const [q, setQ] = useState(initialQ ?? "");
  const [day, setDay] = useState(initialDay ? String(initialDay) : "");
  const [time, setTime] = useState(initialTime ? String(initialTime) : "");

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (q.trim()) {
      params.set("q", q.trim());
    }
    if (day) {
      params.set("day", day);
    }
    if (time) {
      params.set("time", time);
    }

    const query = params.toString();
    router.push(query ? `/lectures?${query}` : "/lectures");
  };

  const clearFilters = () => {
    setQ("");
    setDay("");
    setTime("");
    router.push("/lectures");
  };

  return (
    <Flex gap={2} align="center" wrap="wrap" w="full">
      <Input
        placeholder="講義名で検索（部分一致）"
        value={q}
        onChange={event => setQ(event.target.value)}
        flex="1 1 18rem"
        minW="16rem"
        size="sm"
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            applyFilters();
          }
        }}
      />

      <Select
        value={day}
        onChange={value => setDay(String(value))}
        w="8rem"
        size="sm"
      >
        <Option value="">曜日: すべて</Option>
        {DAYS.map(d => (
          <Option key={d} value={String(d)}>
            {DAY_LABELS[d]}曜
          </Option>
        ))}
      </Select>

      <Select
        value={time}
        onChange={value => setTime(String(value))}
        w="8rem"
        size="sm"
      >
        <Option value="">時限: すべて</Option>
        {TIMES.map(t => (
          <Option key={t} value={String(t)}>
            {t}限
          </Option>
        ))}
      </Select>

      <HStack gap={2} ms="auto">
        <Button colorScheme="primary" size="sm" onClick={applyFilters}>
          検索
        </Button>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          クリア
        </Button>
      </HStack>
    </Flex>
  );
};

export default LectureFilters;
