"use client";

import { HStack, Option, Select, Text } from "@yamada-ui/react";
import { usePathname, useRouter } from "next/navigation";

type UserTimetablePickerProps = {
  terms: { id: string; name: string; number: number; academicYear: number }[];
  selectedTermId: string;
};

const UserTimetablePicker = ({
  terms,
  selectedTermId,
}: UserTimetablePickerProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (nextTermId: string) => {
    const params = new URLSearchParams();
    params.set("tab", "timetable");
    params.set("termId", nextTermId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <HStack>
      <Text fontSize="sm" color="gray.600">
        表示ターム
      </Text>
      <Select value={selectedTermId} onChange={value => handleChange(value)}>
        {terms.map(term => (
          <Option key={term.id} value={term.id}>
            {term.academicYear}年度 第{term.number}ターム
          </Option>
        ))}
      </Select>
    </HStack>
  );
};

export default UserTimetablePicker;
