export const TASK_REMINDER_OFFSETS = [360, 1440, 2880] as const;

export type TaskReminderOffset = (typeof TASK_REMINDER_OFFSETS)[number];

export const TASK_REMINDER_LABELS: Record<TaskReminderOffset, string> = {
  2880: "2日前",
  1440: "1日前",
  360: "6時間前",
};

export const DEFAULT_TASK_REMINDER_OFFSETS: TaskReminderOffset[] = [1440];

export const TASK_DUE_HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

export const TASK_DUE_MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);

export const normalizeTaskReminderOffsets = (
  offsets: number[] | undefined,
): TaskReminderOffset[] => {
  if (!offsets) {
    return DEFAULT_TASK_REMINDER_OFFSETS;
  }

  const allowed = new Set<number>(TASK_REMINDER_OFFSETS);
  const normalized = offsets.filter((value): value is TaskReminderOffset =>
    allowed.has(value),
  );

  return Array.from(new Set(normalized));
};
