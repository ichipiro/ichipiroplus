"use client";

import { updateUser } from "@/features/user/actions";
import {
  type Department,
  type Faculty,
  type UserFormData,
  UserFormSchema,
  type UserWithRelations,
} from "@/features/user/types";
import useActionFeedback from "@/hooks/useActionFeedback";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  Input,
  NumberInput,
  Select,
  type SelectItem,
  Tag,
  Text,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import { useTransition } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import IconUploadField from "./IconUploadField";

interface MyProfileEditFormProps {
  departments: Department[];
  faculties: Faculty[];
  user: UserWithRelations;
  onSuccess?: (data: UserFormData) => void;
  isFirst?: boolean;
}

const MyProfileEditForm = ({
  departments,
  faculties,
  user,
  onSuccess,
  isFirst = false,
}: MyProfileEditFormProps) => {
  const {
    control,
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      username: user.username,
      displayName: user.displayName || "",
      introduction: user.introduction || "",
      facultyId: user.facultyId || undefined,
      departmentId: user.departmentId || undefined,
      grade: user.grade || 1,
    },
  });

  const [isPending, startTransition] = useTransition();
  const { withFeedback } = useActionFeedback();

  const facultyItems: SelectItem[] = faculties.map(faculty => ({
    label: faculty.name,
    value: String(faculty.id),
  }));

  const availableDepartments = departments.filter(
    department => department.facultyId === watch("facultyId"),
  );
  const departmentItems: SelectItem[] = availableDepartments.map(
    department => ({
      label: department.name,
      value: String(department.id),
    }),
  );

  const onSubmit: SubmitHandler<UserFormData> = data => {
    startTransition(async () => {
      const parsedData = UserFormSchema.safeParse(data);
      if (!parsedData.success) {
        const errorMessages = parsedData.error.errors.map(err => err.message);
        throw new Error(errorMessages.join(", "));
      }

      const result = await withFeedback(
        updateUser({
          ...parsedData.data,
          image: parsedData.data.image || undefined,
        }),
        {
          successMessage: "プロフィールが更新されました",
          successTitle: "通知",
        },
      );

      if (result) {
        onSuccess?.(data);
      }
    });
  };

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)}>
      <IconUploadField
        control={control}
        username={watch("displayName")}
        defaultValue={user.image || ""}
        errorMessage={errors.image?.message}
      />

      <FormControl
        invalid={!!errors.displayName}
        label="名前(表示名)"
        errorMessage={errors.displayName?.message}
        required
        requiredIndicator={
          <Tag size="sm" colorScheme="danger" ms={2}>
            必須
          </Tag>
        }
      >
        <Input placeholder="Ichipiro" {...register("displayName")} />
      </FormControl>

      <FormControl
        invalid={!!errors.username}
        label="ユーザー名"
        errorMessage={errors.username?.message}
        required
        requiredIndicator={
          <Tag size="sm" colorScheme="danger" ms={2}>
            必須
          </Tag>
        }
        disabled={!isFirst}
        helperMessage={<Text>基本的に初回以降変更することが出来ません</Text>}
      >
        <Input placeholder="Ichipiro0003" {...register("username")} />
      </FormControl>

      <FormControl
        invalid={!!errors.introduction}
        label="自己紹介"
        errorMessage={
          errors.introduction ? errors.introduction.message : undefined
        }
      >
        <Textarea placeholder="はじめまして" {...register("introduction")} />
      </FormControl>

      <FormControl
        invalid={!!errors.facultyId}
        label="学部"
        errorMessage={errors.facultyId?.message}
        helperMessage={"時間割機能を使用するために必要です"}
      >
        <Controller
          name="facultyId"
          control={control}
          render={({ field }) => (
            <Select placeholder="学部を選択" {...field} items={facultyItems} />
          )}
        />
      </FormControl>

      <FormControl
        invalid={!!errors.departmentId}
        label="学科"
        errorMessage={errors.departmentId?.message}
        helperMessage={
          <>
            <Text>時間割機能を使用するために必要です</Text>
            <Text>※大学院の場合は○○研究科を選択してください</Text>
          </>
        }
      >
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <Select
              placeholder="学科を選択"
              {...field}
              items={departmentItems}
            />
          )}
        />
      </FormControl>

      <FormControl
        invalid={!!errors.grade}
        label="学年"
        errorMessage={errors.grade?.message}
        helperMessage={<Text>時間割機能を使用するために必要です</Text>}
      >
        <Controller
          name="grade"
          control={control}
          render={({ field }) => (
            <NumberInput
              {...field}
              min={1}
              max={4}
              onChange={value => field.onChange(Number(value))}
            />
          )}
        />
      </FormControl>

      <Button
        type="submit"
        alignSelf="flex-end"
        loading={isPending}
        loadingText="更新中"
      >
        決定
      </Button>
    </VStack>
  );
};

export default MyProfileEditForm;
