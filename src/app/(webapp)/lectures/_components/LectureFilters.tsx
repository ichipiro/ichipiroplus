"use client";

import { DAYS, DAY_LABELS, TIMES } from "@/features/timetable/constant";
import { Button, Flex, Input, Option, Select } from "@yamada-ui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Props = {
  initialQ?: string;
  initialDay?: number;
  initialTime?: number;
  initialTermNumber?: number;
  initialFacultyId?: string;
  initialDepartmentId?: string;
  faculties: { id: string; name: string }[];
  departments: { id: string; name: string; facultyId: string }[];
  terms: { id: string; academicYear: number; number: number; name: string }[];
};

const LectureFilters = ({
  initialQ,
  initialDay,
  initialTime,
  initialTermNumber,
  initialFacultyId,
  initialDepartmentId,
  faculties,
  departments,
  terms,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ ?? "");
  const [day, setDay] = useState(initialDay ? String(initialDay) : "");
  const [time, setTime] = useState(initialTime ? String(initialTime) : "");
  const [termNumber, setTermNumber] = useState(
    initialTermNumber ? String(initialTermNumber) : "",
  );
  const [facultyId, setFacultyId] = useState(initialFacultyId ?? "");
  const [departmentId, setDepartmentId] = useState(initialDepartmentId ?? "");

  const departmentOptions = useMemo(
    () =>
      departments.filter(department =>
        facultyId ? department.facultyId === facultyId : true,
      ),
    [departments, facultyId],
  );

  const queryString = useMemo(() => {
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
    if (termNumber) {
      params.set("termNumber", termNumber);
    }
    if (facultyId) {
      params.set("facultyId", facultyId);
    }
    if (departmentId) {
      params.set("departmentId", departmentId);
    }

    return params.toString();
  }, [q, day, time, termNumber, facultyId, departmentId]);

  useEffect(() => {
    if (
      departmentId &&
      !departmentOptions.some(item => item.id === departmentId)
    ) {
      setDepartmentId("");
    }
  }, [departmentId, departmentOptions]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const currentQuery = searchParams.toString();
      if (queryString === currentQuery) return;

      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }, 300);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pathname, queryString, router, searchParams]);

  const clearFilters = () => {
    setQ("");
    setDay("");
    setTime("");
    setTermNumber("");
    setFacultyId("");
    setDepartmentId("");
    router.replace(pathname);
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
        value={termNumber}
        onChange={value => setTermNumber(String(value))}
        w="9rem"
        size="sm"
      >
        <Option value="">ターム: すべて</Option>
        {terms.map(term => (
          <Option key={term.id} value={String(term.number)}>
            第{term.number}ターム
          </Option>
        ))}
      </Select>

      <Select
        value={facultyId}
        onChange={value => setFacultyId(String(value))}
        w="12rem"
        size="sm"
      >
        <Option value="">学部: すべて</Option>
        {faculties.map(faculty => (
          <Option key={faculty.id} value={faculty.id}>
            {faculty.name}
          </Option>
        ))}
      </Select>

      <Select
        value={departmentId}
        onChange={value => setDepartmentId(String(value))}
        w="14rem"
        size="sm"
      >
        <Option value="">学科: すべて</Option>
        {departmentOptions.map(department => (
          <Option key={department.id} value={department.id}>
            {department.name}
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

      <Button variant="outline" size="sm" ms="auto" onClick={clearFilters}>
        クリア
      </Button>
    </Flex>
  );
};

export default LectureFilters;
