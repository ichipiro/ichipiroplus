import { getLectureCatalogPage } from "@/features/timetable/actions/lectures";
import { getCurrentTerm, getTerms } from "@/features/timetable/actions/terms";
import LectureList from "@/features/timetable/components/LectureList";
import { getAllDepartments, getAllFaculties } from "@/features/user/actions";
import {
  Badge,
  Button,
  Flex,
  HStack,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react";
import type { Metadata } from "next";
import LectureFilters from "./_components/LectureFilters";

const PAGE_SIZE = 50;

const parsePage = (value?: string) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) {
    return 1;
  }

  return Math.floor(num);
};

const parseDayOrTime = (value?: string) => {
  if (!value) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) {
    return undefined;
  }
  return Math.floor(num);
};

const buildPageHref = ({
  page,
  q,
  day,
  time,
  termNumber,
  facultyId,
  departmentId,
}: {
  page: number;
  q?: string;
  day?: number;
  time?: number;
  termNumber?: number;
  facultyId?: string;
  departmentId?: string;
}) => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (q && q.trim().length > 0) {
    params.set("q", q.trim());
  }
  if (day) {
    params.set("day", String(day));
  }
  if (time) {
    params.set("time", String(time));
  }
  if (termNumber) {
    params.set("termNumber", String(termNumber));
  }
  if (facultyId) {
    params.set("facultyId", facultyId);
  }
  if (departmentId) {
    params.set("departmentId", departmentId);
  }
  return `/lectures?${params.toString()}`;
};

export const metadata: Metadata = {
  title: "講義検索",
  description: "すべての公開講義をテーブル形式で閲覧できます",
};

type LecturesPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    day?: string;
    time?: string;
    termNumber?: string;
    facultyId?: string;
    departmentId?: string;
  }>;
};

const LecturesPage = async ({ searchParams }: LecturesPageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [currentTerm, terms, faculties, departments] = await Promise.all([
    getCurrentTerm(),
    getTerms(),
    getAllFaculties(),
    getAllDepartments(),
  ]);
  const page = parsePage(resolvedSearchParams?.page);
  const q = resolvedSearchParams?.q?.trim() || "";
  const day = parseDayOrTime(resolvedSearchParams?.day);
  const time = parseDayOrTime(resolvedSearchParams?.time);
  const termNumber = parseDayOrTime(resolvedSearchParams?.termNumber);
  const facultyId = resolvedSearchParams?.facultyId?.trim() || undefined;
  const departmentId = resolvedSearchParams?.departmentId?.trim() || undefined;
  const currentYearTerms = terms.filter(
    term => term.academicYear === currentTerm.academicYear,
  );
  const { lectures, totalCount } = await getLectureCatalogPage({
    page,
    pageSize: PAGE_SIZE,
    nameQuery: q || undefined,
    day,
    time,
    termNumber,
    facultyId,
    departmentId,
    academicYear: currentTerm.academicYear,
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <VStack w="full" align="stretch" gap={6}>
      <Flex
        w="full"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        gap={3}
      >
        <Heading as="h1" size="xl">
          講義検索
        </Heading>
        <Badge colorScheme="blue" variant="subtle">
          {totalCount.toLocaleString()}件
        </Badge>
      </Flex>

      <Text color="gray.600">
        公開講義を一覧表示しています。講義名をクリックすると詳細ページへ移動できます。
      </Text>

      <LectureFilters
        initialQ={q}
        initialDay={day}
        initialTime={time}
        initialTermNumber={termNumber}
        initialFacultyId={facultyId}
        initialDepartmentId={departmentId}
        faculties={faculties}
        departments={departments}
        terms={currentYearTerms}
      />

      <LectureList lectures={lectures} termId={currentTerm.id} />

      <HStack justify="space-between" w="full">
        <Button
          as="a"
          href={buildPageHref({
            page: Math.max(1, page - 1),
            q,
            day,
            time,
            termNumber,
            facultyId,
            departmentId,
          })}
          disabled={page <= 1}
          variant="outline"
        >
          前へ
        </Button>

        <Text>
          {page} / {totalPages} ページ
        </Text>

        <Button
          as="a"
          href={buildPageHref({
            page: Math.min(totalPages, page + 1),
            q,
            day,
            time,
            termNumber,
            facultyId,
            departmentId,
          })}
          disabled={page >= totalPages}
          variant="outline"
        >
          次へ
        </Button>
      </HStack>
    </VStack>
  );
};

export default LecturesPage;
