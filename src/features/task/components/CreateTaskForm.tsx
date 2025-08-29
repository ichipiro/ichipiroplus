"use client";

import {
  type TaskFormData,
  TaskPriority,
  type TaskPriorityType,
  TaskStatus,
  taskFormSchema,
} from "@/features/task/types";
import type { RegistrationWithRelations } from "@/features/timetable/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@yamada-ui/calendar";
import {
  Box,
  Button,
  FormControl,
  Input,
  Radio,
  RadioGroup,
  Select,
  type SelectItem,
  Tag,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import { useTaskStore } from "../store/useTaskStore";
import "dayjs/locale/ja";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

interface CreateTaskFormProps {
  onSuccess?: () => void;
  registrations?: RegistrationWithRelations[];
  defaultRegistrationId?: string;
}

const CreateTaskForm = ({
  onSuccess,
  registrations,
  defaultRegistrationId,
}: CreateTaskFormProps) => {
  const { createTask, isPending } = useTaskStore();
  const { withFeedback } = useActionFeedback();

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
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
    },
  });

  const lectureItems: SelectItem[] | undefined = registrations?.map(
    registration => ({
      label: registration.lecture.name,
      value: String(registration.id),
    }),
  );

  const handleFormSubmit: SubmitHandler<TaskFormData> = async data => {
    const registrationId = data.registrationId || defaultRegistrationId;

    const result = await withFeedback(
      createTask({
        title: data.title,
        description: data.description,
        priority: data.priority as TaskPriorityType,
        dueDate: data.dueDate || undefined,
        registrationId: registrationId || undefined,
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
        </FormControl>

        <FormControl label="優先度" invalid={!!errors.priority}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <RadioGroup
                direction="row"
                {...field}
                value={String(field.value)}
                onChange={value => field.onChange(Number(value))}
              >
                <Radio value={String(TaskPriority.LOW)}>低</Radio>
                <Radio value={String(TaskPriority.MEDIUM)}>中</Radio>
                <Radio value={String(TaskPriority.HIGH)}>高</Radio>
              </RadioGroup>
            )}
          />
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
