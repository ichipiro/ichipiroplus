import {
  canEditLecture,
  getLectureCatalogDetail,
} from "@/features/timetable/actions/lectures";
import LectureCatalogHeader from "@/features/timetable/components/lecture-catalog/LectureCatalogHeader";
import LectureCatalogMetaGrid from "@/features/timetable/components/lecture-catalog/LectureCatalogMetaGrid";
import LectureCatalogSections from "@/features/timetable/components/lecture-catalog/LectureCatalogSections";
import { Divider, VStack } from "@yamada-ui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "講義詳細",
  description: "講義情報の詳細",
};

type LectureDetailPageProps = {
  params: Promise<{
    lectureId: string;
  }>;
};

const LectureDetailPage = async ({ params }: LectureDetailPageProps) => {
  const { lectureId } = await params;
  const [lecture, canEdit] = await Promise.all([
    getLectureCatalogDetail(lectureId),
    canEditLecture(lectureId),
  ]);

  return (
    <VStack w="full" align="stretch" gap={6}>
      <LectureCatalogHeader lecture={lecture} canEdit={canEdit} />
      <LectureCatalogMetaGrid lecture={lecture} />

      <Divider />
      <LectureCatalogSections lecture={lecture} />
    </VStack>
  );
};

export default LectureDetailPage;
