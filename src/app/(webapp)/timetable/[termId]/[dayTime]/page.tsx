import { getLectures } from "@/features/timetable/actions/lectures";
import { getRegistrationsBySchedule } from "@/features/timetable/actions/registrations";
import { getTerm } from "@/features/timetable/actions/terms";
import LectureDetail from "@/features/timetable/components/LectureDetail";
import LectureList from "@/features/timetable/components/LectureList";
import { getDayTimeByScheduleKey } from "@/features/timetable/utils";

interface TimeSlotPageProps {
  params: {
    termId: string;
    dayTime: string;
  };

  // TODO: タブを状態管理からクエリパラメータでの管理にする
  searchParams: {
    tab?: string;
  };
}

const TimeSlotPage = async ({ params, searchParams }: TimeSlotPageProps) => {
  const dayTime = Number.parseInt(params.dayTime);
  // TODO: タブを状態管理からクエリパラメータでの管理にする
  // const tab = searchParams.tab || "tasks";
  const { day, time } = getDayTimeByScheduleKey(dayTime);

  const term = await getTerm(params.termId);

  const registrations = await getRegistrationsBySchedule(dayTime, term.id);
  if (registrations.length) {
    return <LectureDetail registration={registrations[0]} />;
  }

  const lectures = await getLectures({
    day,
    time,
    termNumber: term.number,
  });

  return <LectureList lectures={lectures} termId={term.id} />;
};

export default TimeSlotPage;
