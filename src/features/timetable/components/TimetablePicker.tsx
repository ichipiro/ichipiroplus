"use client";

import type { Term } from "@prisma/client";
import { HStack, Option, Select } from "@yamada-ui/react";
import { useRouter } from "next/navigation";

interface TimetablePickerProps {
  allTerms: Term[];
  nowTerm: Term;
}

const TimetablePicker = ({ allTerms, nowTerm }: TimetablePickerProps) => {
  const router = useRouter();

  const handleTermChange = (value: string) => {
    router.push(`/timetable/${value}`);
  };

  return (
    <HStack>
      <Select value={String(nowTerm.id)} onChange={handleTermChange}>
        {allTerms.map(term => {
          return (
            <Option value={term.id} key={term.id}>
              {term.name}
            </Option>
          );
        })}
      </Select>
    </HStack>
  );
};

export default TimetablePicker;
