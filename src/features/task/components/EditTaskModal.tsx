"use client";

import {
  type TaskFormData,
  TaskPriority,
  type TaskPriorityType,
  TaskStatus,
  type TaskStatusType,
  taskFormSchema,
} from "@/features/task/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Task } from "@prisma/client";
import { DatePicker } from "@yamada-ui/calendar";
import {
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Select,
  type SelectItem,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import { useEffect } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task: Task | null;
  lectureItems?: SelectItem[];
  onUpdate: (
    taskId: string,
    data: Partial<TaskFormData>,
  ) => Promise<unknown>;
  isPending?: boolean;
}

const EditTaskModal = ({
  isOpen,
  onClose,
  onSuccess,
  task,
  lectureItems,
  onUpdate,
  isPending = false,
}: EditTaskModalProps) => {
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
      registrationId: null,
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        registrationId: task.registrationId || null,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      });
    }
  }, [task, reset]);

  const onSubmit: SubmitHandler<TaskFormData> = async data => {
    if (!task) return;

    const result = await withFeedback(
      onUpdate(task.id, {
        title: data.title,
        description: data.description,
        priority: data.priority as TaskPriorityType,
        status: data.status as TaskStatusType,
        dueDate: data.dueDate || undefined,
        registrationId: data.registrationId || undefined,
      }),
      {
        successMessage: "タスクを更新しました",
        successTitle: "タスク更新",
      },
    );

    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalBody>
        <VStack as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>タスクを編集</ModalHeader>
          <ModalCloseButton />

          <VStack>
            <FormControl invalid={!!errors.title} required>
              <Input placeholder="タスクのタイトル" {...register("title")} />
            </FormControl>

            {lectureItems && (
              <FormControl>
                <Controller
                  name="registrationId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="講義を選択(任意)"
                      {...field}
                      items={lectureItems}
                      value={field.value || undefined}
                      onChange={value => field.onChange(value)}
                    />
                  )}
                />
              </FormControl>
            )}

            <FormControl>
              <Textarea
                placeholder="タスクの詳細を入力してください"
                {...register("description")}
                rows={3}
              />
            </FormControl>

            <FormControl invalid={!!errors.dueDate}>
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

            <FormControl invalid={!!errors.priority}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <RadioGroup
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

            <FormControl invalid={!!errors.status}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    value={String(field.value)}
                    onChange={value => field.onChange(Number(value))}
                  >
                    <Radio value={String(TaskStatus.TODO)}>未着手</Radio>
                    <Radio value={String(TaskStatus.IN_PROGRESS)}>進行中</Radio>
                    <Radio value={String(TaskStatus.DONE)}>完了</Radio>
                  </RadioGroup>
                )}
              />
            </FormControl>
          </VStack>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" colorScheme="blue" loading={isPending}>
              保存
            </Button>
          </ModalFooter>
        </VStack>
      </ModalBody>
    </Modal>
  );
};

export default EditTaskModal;
