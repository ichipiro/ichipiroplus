import type { Task } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { TASK_REMINDER_OFFSETS } from "../../constants";
import { applyTimeToDate, formatDueDateLabel, toTimeValue } from "./utils";

export const useTaskItemDraft = (task: Task) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [registrationId, setRegistrationId] = useState<string | undefined>(
    task.registrationId ?? undefined,
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined,
  );
  const [dueTime, setDueTime] = useState<string>(
    toTimeValue(task.dueDate ? new Date(task.dueDate) : undefined),
  );
  const [reminderOffsets, setReminderOffsets] = useState<number[]>(
    task.reminderOffsets,
  );

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setRegistrationId(task.registrationId ?? undefined);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setDueTime(toTimeValue(task.dueDate ? new Date(task.dueDate) : undefined));
    setReminderOffsets(task.reminderOffsets);
  }, [task]);

  const formattedDueDate = useMemo(
    () => formatDueDateLabel(dueDate),
    [dueDate],
  );

  const hasChanges = useMemo(() => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description;
    const originalDueTime = task.dueDate
      ? new Date(task.dueDate).getTime()
      : null;
    const currentDueTime = dueDate ? dueDate.getTime() : null;

    return (
      normalizedTitle !== task.title ||
      normalizedDescription !== (task.description ?? "") ||
      registrationId !== (task.registrationId ?? undefined) ||
      originalDueTime !== currentDueTime ||
      reminderOffsets.join(",") !== task.reminderOffsets.join(",")
    );
  }, [description, dueDate, registrationId, reminderOffsets, task, title]);

  const orderedReminderOffsets = TASK_REMINDER_OFFSETS.filter(offset =>
    reminderOffsets.includes(offset),
  );

  const toggleReminderOffset = (offset: number) => {
    setReminderOffsets(prev =>
      prev.includes(offset)
        ? prev.filter(value => value !== offset)
        : [...prev, offset],
    );
  };

  const setDueDateByPicker = (value: Date | undefined) => {
    if (!value) {
      setDueDate(undefined);
      return;
    }
    setDueDate(applyTimeToDate(value, dueTime));
  };

  const setDueHour = (hour: string | undefined) => {
    const [, minute = "00"] = dueTime.split(":");
    const nextTime = `${hour || "09"}:${minute}`;
    setDueTime(nextTime);
    if (dueDate) {
      setDueDate(applyTimeToDate(dueDate, nextTime));
    }
  };

  const setDueMinute = (minute: string | undefined) => {
    const [hour = "09"] = dueTime.split(":");
    const nextTime = `${hour}:${minute || "00"}`;
    setDueTime(nextTime);
    if (dueDate) {
      setDueDate(applyTimeToDate(dueDate, nextTime));
    }
  };

  return {
    title,
    description,
    registrationId,
    dueDate,
    dueTime,
    reminderOffsets,
    formattedDueDate,
    hasChanges,
    orderedReminderOffsets,
    setTitle,
    setDescription,
    setRegistrationId,
    setDueDateByPicker,
    setDueHour,
    setDueMinute,
    toggleReminderOffset,
  };
};
