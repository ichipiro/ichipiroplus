"use client";

import {
  type TaskFormData,
  TaskStatus,
  taskFormSchema,
} from "@/features/task/types";
import {
  DEFAULT_TASK_REMINDER_OFFSETS,
  TASK_DUE_HOURS,
  TASK_DUE_MINUTES,
} from "../constants";
import useActionFeedback from "@/hooks/useActionFeedback";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@yamada-ui/calendar";
import {
  Box,
  Button,
  FormControl,
  HStack,
  Input,
  Select,
  type SelectItem,
  Tag,
  Text,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import "dayjs/locale/ja";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

interface CreateTaskFormProps {
  onSuccess?: () => void;
  lectureItems?: SelectItem[];
  defaultRegistrationId?: string;
  onCreate: (data: Omit<TaskFormData, "status">) => Promise<unknown>;
  isPending?: boolean;
}

const CreateTaskForm = ({
  onSuccess,
  lectureItems,
  defaultRegistrationId,
  onCreate,
  isPending = false,
}: CreateTaskFormProps) => {
  const { withFeedback } = useActionFeedback();
  const [dueTime, setDueTime] = useState("09:00");
  const hourItems: SelectItem[] = TASK_DUE_HOURS.map(value => ({
    value,
    label: `${value}時`,
  }));
  const minuteItems: SelectItem[] = TASK_DUE_MINUTES.map(value => ({
    value,
    label: `${value}分`,
  }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      registrationId: defaultRegistrationId,
      status: TaskStatus.INCOMPLETE,
      reminderOffsets: DEFAULT_TASK_REMINDER_OFFSETS,
    },
  });

  const handleFormSubmit: SubmitHandler<TaskFormData> = async data => {
    const registrationId =
      data.registrationId === undefined
        ? defaultRegistrationId
        : (data.registrationId ?? undefined);

    const resolvedDueDate = data.dueDate
      ? (() => {
          const [hoursRaw, minutesRaw] = dueTime.split(":");
          const nextDate = new Date(data.dueDate as Date);
          nextDate.setHours(Number(hoursRaw) || 9);
          nextDate.setMinutes(Number(minutesRaw) || 0);
          nextDate.setSeconds(0, 0);
          return nextDate;
        })()
      : undefined;

    const result = await withFeedback(
      onCreate({
        title: data.title,
        description: data.description,
        dueDate: resolvedDueDate,
        registrationId,
        reminderOffsets: data.reminderOffsets,
      }),
      {
        successMessage: "新しいタスクを作成しました",
        successTitle: "タスク作成",
      },
    );

    if (result) {
      reset();
      onSuccess?.();
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      bg={["white", "black"]}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      shadow="sm"
    >
      <VStack>
        <FormControl
          label="タイトル"
          invalid={!!errors.title}
          required
          requiredIndicator={
            <Tag size="sm" colorScheme="danger" ms={2}>
              必須
            </Tag>
          }
        >
          <Input placeholder="タスクのタイトル" {...register("title")} />
        </FormControl>

        {lectureItems && (
          <FormControl label="講義" invalid={!!errors.title}>
            <Controller
              name="registrationId"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder="講義を選択"
                  {...field}
                  items={lectureItems}
                  value={field.value || undefined}
                  onChange={value => field.onChange(value)}
                />
              )}
            />
          </FormControl>
        )}

        <FormControl label="詳細">
          <Textarea
            placeholder="タスクの詳細を入力してください"
            {...register("description")}
            rows={3}
          />
        </FormControl>

        <FormControl label="期限" invalid={!!errors.dueDate}>
          <VStack align="stretch">
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="YYYY/MM/DD"
                  {...field}
                  value={field.value || undefined}
                  onChange={value => field.onChange(value)}
                />
              )}
            />
            <HStack gap={1}>
              <Select
                items={hourItems}
                value={dueTime.split(":")[0] || "09"}
                onChange={value => {
                  const [, minute = "00"] = dueTime.split(":");
                  setDueTime(`${value || "09"}:${minute}`);
                }}
                portalProps={{ disabled: true }}
                w={{ base: "6.5rem", sm: "5.5rem" }}
              />
              <Text fontSize="sm">:</Text>
              <Select
                items={minuteItems}
                value={dueTime.split(":")[1] || "00"}
                onChange={value => {
                  const [hour = "09"] = dueTime.split(":");
                  setDueTime(`${hour}:${value || "00"}`);
                }}
                portalProps={{ disabled: true }}
                w={{ base: "6.5rem", sm: "5.5rem" }}
              />
            </HStack>
          </VStack>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          alignSelf="flex-end"
          loading={isPending}
        >
          タスクを作成
        </Button>
      </VStack>
    </Box>
  );
};

export default CreateTaskForm;
