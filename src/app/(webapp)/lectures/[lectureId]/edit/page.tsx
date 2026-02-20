import {
  canEditLecture,
  getLectureCatalogDetail,
} from "@/features/timetable/actions/lectures";
import { getTerms } from "@/features/timetable/actions/terms";
import EditLectureForm from "@/features/timetable/components/EditLectureForm";
import { getScheduleKey } from "@/features/timetable/utils";
import { getMe } from "@/features/user/actions";
import { Button, Heading, Text, VStack } from "@yamada-ui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "講義編集",
  description: "講義情報を編集します",
};

type LectureEditPageProps = {
  params: Promise<{
    lectureId: string;
  }>;
};

const LectureEditPage = async ({ params }: LectureEditPageProps) => {
  const { lectureId } = await params;
  const [lecture, terms, canEdit, me] = await Promise.all([
    getLectureCatalogDetail(lectureId),
    getTerms(),
    canEditLecture(lectureId),
    getMe(),
  ]);
  const isOwner = lecture.owner.id === me;

  return (
    <VStack align="stretch" gap={4} w="full">
      <Heading as="h1" size="xl">
        講義編集
      </Heading>
      <Text color="gray.600">講義情報を編集できます。</Text>

      <EditLectureForm
        lectureId={lecture.id}
        initialData={{
          name: lecture.name,
          instructor: lecture.instructor || "",
          room: lecture.room || "",
          biko: lecture.biko || "",
          termNumbers: lecture.lectureTerms.map(term => term.termNumber),
          scheduleIds: lecture.schedules.map(schedule =>
            getScheduleKey(schedule.day, schedule.time),
          ),
          isPublic: lecture.isPublic,
          isPublicEditable: lecture.isPublicEditable,
        }}
        termOptions={terms.map(term => ({
          number: term.number,
          name: term.name,
        }))}
        canEdit={canEdit}
        canChangeVisibility={isOwner}
      />

      <Button
        as="a"
        href={`/lectures/${lecture.id}`}
        variant="outline"
        w="fit-content"
      >
        詳細に戻る
      </Button>
    </VStack>
  );
};

export default LectureEditPage;
