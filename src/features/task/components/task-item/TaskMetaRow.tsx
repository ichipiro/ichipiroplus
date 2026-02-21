import { DatePicker } from "@yamada-ui/calendar";
import { CalendarIcon } from "@yamada-ui/lucide";
import { Badge, HStack, Select, type SelectItem, Text } from "@yamada-ui/react";
import { useMemo } from "react";
import { TIME_HOUR_ITEMS, TIME_MINUTE_ITEMS } from "./utils";

const NO_LECTURE_VALUE = "__NO_LECTURE__";

interface TaskMetaRowProps {
  isEditing: boolean;
  dueDate: Date | undefined;
  dueTime: string;
  formattedDueDate: string | null;
  lectureItems?: SelectItem[];
  registrationId?: string;
  registrationLabel?: string;
  onDueDateChange: (value: Date | undefined) => void;
  onDueHourChange: (hour: string | undefined) => void;
  onDueMinuteChange: (minute: string | undefined) => void;
  onRegistrationChange: (value: string | undefined) => void;
}

const TaskMetaRow = ({
  isEditing,
  dueDate,
  dueTime,
  formattedDueDate,
  lectureItems,
  registrationId,
  registrationLabel,
  onDueDateChange,
  onDueHourChange,
  onDueMinuteChange,
  onRegistrationChange,
}: TaskMetaRowProps) => {
  const lectureSelectItems = useMemo<SelectItem[]>(
    () =>
      lectureItems
        ? [{ label: "講義未設定", value: NO_LECTURE_VALUE }, ...lectureItems]
        : [],
    [lectureItems],
  );

  return (
    <HStack
      gap={2}
      flexWrap={isEditing ? "wrap" : "nowrap"}
      flexDir={isEditing ? "row" : { base: "row", md: "column" }}
      align={isEditing ? "center" : { base: "center", md: "stretch" }}
      minW={0}
    >
      {isEditing ? (
        <HStack
          gap={2}
          w={{ base: "auto", md: "full" }}
          flexDir={{ base: "row", md: "column" }}
          align={{ base: "center", md: "stretch" }}
        >
          <DatePicker
            value={dueDate}
            onChange={value => onDueDateChange(value || undefined)}
            placeholder="期限日を設定"
            size="sm"
            maxW={{ base: "xs", md: "full" }}
          />
          <HStack gap={1} minW={0} w={{ base: "auto", md: "full" }}>
            <Select
              items={TIME_HOUR_ITEMS}
              value={dueTime.split(":")[0] || "09"}
              onChange={value => onDueHourChange(value)}
              portalProps={{ disabled: true }}
              size="sm"
              w={{ base: "5.5rem", md: "6.5rem" }}
            />
            <Text fontSize="sm">:</Text>
            <Select
              items={TIME_MINUTE_ITEMS}
              value={dueTime.split(":")[1] || "00"}
              onChange={value => onDueMinuteChange(value)}
              portalProps={{ disabled: true }}
              size="sm"
              w={{ base: "5.5rem", md: "6.5rem" }}
            />
          </HStack>
        </HStack>
      ) : (
        <HStack
          as="span"
          borderWidth="1px"
          borderRadius="full"
          px={2}
          py={1}
          minW={0}
          maxW="full"
          color={["gray.700", "gray.100"]}
          borderColor={["gray.300", "gray.500"]}
          bg={["gray.100", "gray.700"]}
          gap={1}
        >
          <CalendarIcon size="sm" />
          <Text fontSize="xs" lineClamp={1}>
            {formattedDueDate ?? "未設定"}
          </Text>
        </HStack>
      )}

      {isEditing && lectureItems ? (
        <Select
          items={lectureSelectItems}
          value={registrationId}
          onChange={value =>
            onRegistrationChange(
              value === NO_LECTURE_VALUE ? undefined : (value ?? undefined),
            )
          }
          portalProps={{ disabled: true }}
          placeholder="講義を選択"
          placeholderInOptions={false}
          size="sm"
          w={{ base: "xs", md: "full" }}
        />
      ) : (
        <Badge
          colorScheme="purple"
          variant="subtle"
          alignSelf={{ base: "flex-start", md: "stretch" }}
          borderRadius="full"
          px={2}
          py={1}
          minW={0}
          maxW={{ base: "70%", md: "full" }}
        >
          <Text
            fontSize="xs"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {registrationLabel ?? "講義未設定"}
          </Text>
        </Badge>
      )}
    </HStack>
  );
};

export default TaskMetaRow;
