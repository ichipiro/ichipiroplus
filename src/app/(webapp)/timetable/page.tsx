import { getCurrentTerm } from "@/features/timetable/actions/terms";
import { redirect } from "next/navigation";

const TimeTableOriginPage = async () => {
  const term = await getCurrentTerm();

  redirect(`/timetable/${term.id}`);
};

export default TimeTableOriginPage;
