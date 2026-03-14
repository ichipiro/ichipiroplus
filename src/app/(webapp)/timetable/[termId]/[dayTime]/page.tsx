import { getLectures } from "@/features/timetable/actions/lectures";
import { getRegistrationsBySchedule } from "@/features/timetable/actions/registrations";
import { getTerm } from "@/features/timetable/actions/terms";
import LectureDetail from "@/features/timetable/components/LectureDetail";
import LectureList from "@/features/timetable/components/LectureList";
import { getDayTimeByScheduleKey } from "@/features/timetable/utils";

interface TimeSlotPageProps {
  params: Promise<{
    termId: string;
    dayTime: string;
  }>;

  searchParams: Promise<{
    tab?: string;
  }>;
}

const TimeSlotPage = async ({ params, searchParams }: TimeSlotPageProps) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const dayTime = Number.parseInt(resolvedParams.dayTime, 10);
  const tab = resolvedSearchParams.tab || "attendance";
  const { day, time } = getDayTimeByScheduleKey(dayTime);

  const term = await getTerm(resolvedParams.termId);

  const registration = await getRegistrationsBySchedule(dayTime, term.id);
  if (registration) {
    return <LectureDetail tab={tab} registration={registration} />;
  }

  const lectures = await getLectures({
    day,
    time,
    termNumber: term.number,
    academicYear: term.academicYear,
  });

  return (
    <LectureList
      lectures={lectures}
      termId={term.id}
      currentTermNumber={term.number}
      emptyMessage="この時間帯に登録できる講義はありません。"
    />
  );
};

export default TimeSlotPage;
