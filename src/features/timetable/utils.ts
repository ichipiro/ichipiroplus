import { DAYS, MAX_TIME, TIMES } from "./constant";

/**
 * 年度とタームを検証する
 * @param year - 年度
 * @param term - ターム
 * @returns 有効ならtrue, 無効ならfalse
 */
export const isValidTermYear = (year: number, term: number) => {
  return (
    !Number.isNaN(year) ||
    !Number.isNaN(term) ||
    term >= 1 ||
    term <= 4 ||
    year >= 2020 ||
    year <= new Date().getFullYear() + 1
  );
};

/**
 * 日付と時限から一意のスケジュールキーを返す
 * @param day - 日付の数値(月=1, 火=2, ...)
 * @param time - 時限の数値(1限=1, 2限=2, ...)
 * @returns スケジュールキー
 */
export const getScheduleKey = (day: number, time: number) => {
  return (day - 1) * MAX_TIME + time;
};

/**
 * スケジュールキーから日付と時限の数値を返す
 * @param scheduleKey - スケジュールキー
 * @returns day:日付の数値(月=1, 火=2, ...), time:時限の数値(1限=1, 2限=2, ...)
 */
export const getDayTimeByScheduleKey = (scheduleKey: number) => {
  const day = Math.floor(scheduleKey / MAX_TIME) + 1;
  const time = scheduleKey % MAX_TIME;
  return { day, time };
};

export const DAY_LABELS: Record<number, string> = {
  1: "月",
  2: "火",
  3: "水",
  4: "木",
  5: "金",
};

export const formatDayTimeLabel = (day: number, time: number) => {
  return `${DAY_LABELS[day] ?? day}曜${time}限`;
};

export const SCHEDULE_OPTIONS = DAYS.flatMap(day =>
  TIMES.map(time => ({
    id: getScheduleKey(day, time),
    label: formatDayTimeLabel(day, time),
  })),
);
