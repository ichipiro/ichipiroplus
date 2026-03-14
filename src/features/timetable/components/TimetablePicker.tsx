import type { Term } from "@prisma/client";
import { HStack, Option, Select } from "@yamada-ui/react";
import Link from "next/link";
import { getTerms } from "../actions";

interface TimetablePickerProps {
  nowTerm: Term;
}

const TimetablePicker = async ({ nowTerm }: TimetablePickerProps) => {
  const allTerms = await getTerms();
  return (
    <HStack>
      <Select value={String(nowTerm.id)}>
        {allTerms.map(term => {
          return (
            <Option value={term.id} key={term.id}>
              <Link href={`/timetable/${term.id}`} key={term.id}>
                {term.academicYear}年度 第{term.number}ターム
              </Link>
            </Option>
          );
        })}
      </Select>
    </HStack>
  );
};

export default TimetablePicker;
