import { getTimetableByUserId } from "@/features/timetable/actions/sharing";
import { Text, VStack } from "@yamada-ui/react";
import { Suspense } from "react";
import CopyTimetableButton from "./CopyTimetableButton";
import TimetableGrid from "./TimetableGrid";
import UserTimetablePicker from "./UserTimetablePicker";

interface SharedTimetableSectionProps {
  userId: string;
  displayName: string;
  isOwner: boolean;
  isTimetablePublic: boolean;
  selectedTermId: string;
  terms: { id: string; name: string; number: number; academicYear: number }[];
}

const SharedTimetableSection = async ({
  userId,
  displayName,
  isOwner,
  isTimetablePublic,
  selectedTermId,
  terms,
}: SharedTimetableSectionProps) => {
  const canViewTimetable = isOwner || isTimetablePublic;
  const timetableData = canViewTimetable
    ? await getTimetableByUserId({
        userId,
        includePrivate: isOwner,
        termId: selectedTermId,
      })
    : null;

  return (
    <VStack align="stretch" gap={4}>
      <Suspense
        fallback={
          <Text fontSize="sm" color="gray.600">
            タームを読み込み中...
          </Text>
        }
      >
        <UserTimetablePicker terms={terms} selectedTermId={selectedTermId} />
      </Suspense>

      {!isOwner && canViewTimetable && (
        <CopyTimetableButton
          sourceUserId={userId}
          sourceDisplayName={displayName}
          termId={selectedTermId}
        />
      )}

      {!canViewTimetable && (
        <Text color="gray.600">このユーザーの時間割は非公開です。</Text>
      )}

      {canViewTimetable &&
        timetableData &&
        timetableData.items.length === 0 && (
          <Text color="gray.600">このタームの登録講義はありません。</Text>
        )}

      {canViewTimetable && timetableData && timetableData.items.length > 0 && (
        <TimetableGrid termId={selectedTermId} readonly targetUserId={userId} />
      )}
    </VStack>
  );
};

export default SharedTimetableSection;
