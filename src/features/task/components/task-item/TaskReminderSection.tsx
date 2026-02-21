import { Checkbox, HStack, Text, Badge } from "@yamada-ui/react";
import { TASK_REMINDER_LABELS, TASK_REMINDER_OFFSETS } from "../../constants";
import { getReminderLabel } from "./utils";

interface TaskReminderSectionProps {
  isEditing: boolean;
  reminderOffsets: number[];
  orderedReminderOffsets: readonly number[];
  onToggleOffset: (offset: number) => void;
}

const TaskReminderSection = ({
  isEditing,
  reminderOffsets,
  orderedReminderOffsets,
  onToggleOffset,
}: TaskReminderSectionProps) => {
  return (
    <HStack gap={2} flexWrap="wrap" minW={0}>
      <Text fontSize="xs" color="gray.500">
        通知:
      </Text>
      {isEditing ? (
        TASK_REMINDER_OFFSETS.map(offset => (
          <Checkbox
            key={offset}
            checked={reminderOffsets.includes(offset)}
            onChange={event => {
              event.stopPropagation();
              onToggleOffset(offset);
            }}
            onClick={event => event.stopPropagation()}
          >
            {TASK_REMINDER_LABELS[offset]}
          </Checkbox>
        ))
      ) : reminderOffsets.length > 0 ? (
        orderedReminderOffsets.map(offset => (
          <Badge key={offset} size="sm" variant="subtle">
            {getReminderLabel(offset)}
          </Badge>
        ))
      ) : (
        <Text fontSize="xs" color="gray.500">
          通知なし
        </Text>
      )}
    </HStack>
  );
};

export default TaskReminderSection;
