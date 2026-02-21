import type { SelectItem } from "@yamada-ui/react";
import {
  TASK_DUE_HOURS,
  TASK_DUE_MINUTES,
  TASK_REMINDER_LABELS,
} from "../../constants";

export const getReminderLabel = (offset: number) => {
  return TASK_REMINDER_LABELS[offset as keyof typeof TASK_REMINDER_LABELS]
    ? TASK_REMINDER_LABELS[offset as keyof typeof TASK_REMINDER_LABELS]
    : `${offset}分前`;
};

export const toTimeValue = (date: Date | undefined) => {
  if (!date) return "09:00";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const applyTimeToDate = (date: Date, time: string) => {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  const nextDate = new Date(date);
  nextDate.setHours(Number.isNaN(hours) ? 9 : hours);
  nextDate.setMinutes(Number.isNaN(minutes) ? 0 : minutes);
  nextDate.setSeconds(0, 0);

  return nextDate;
};

export const formatDueDateLabel = (date: Date | undefined) => {
  if (!date) return null;

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const TIME_HOUR_ITEMS: SelectItem[] = TASK_DUE_HOURS.map(value => ({
  value,
  label: `${value}時`,
}));

export const TIME_MINUTE_ITEMS: SelectItem[] = TASK_DUE_MINUTES.map(value => ({
  value,
  label: `${value}分`,
}));
