"use client";

import { sendBulkPushNotification } from "@/features/webpush/actions";
import useActionFeedback from "@/hooks/useActionFeedback";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  type SelectItem,
  Tag,
  Text,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import { useTransition } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const notificationSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  body: z
    .string()
    .min(1, "本文は必須です")
    .max(500, "本文は500文字以内で入力してください"),
  url: z.string().optional(),
  notificationType: z.enum(["system", "task", "lecture"]),
  recipientType: z.enum(["all", "selected"]),
  userIds: z.string().optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationSender() {
  const [isPending, startTransition] = useTransition();
  const { withFeedback } = useActionFeedback();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      body: "",
      url: "/",
      notificationType: "system",
      recipientType: "all",
      userIds: "",
    },
  });

  const recipientType = watch("recipientType");

  const notificationTypeItems: SelectItem[] = [
    { label: "システム通知", value: "system" },
    { label: "タスク通知", value: "task" },
    { label: "講義開始通知", value: "lecture" },
  ];

  const onSubmit: SubmitHandler<NotificationFormData> = data => {
    startTransition(async () => {
      const userIdArray =
        data.recipientType === "selected"
          ? data.userIds
              ?.split(",")
              .map(id => id.trim())
              .filter(Boolean) || []
          : [];

      const result = await withFeedback(
        sendBulkPushNotification({
          allUsers: data.recipientType === "all",
          userIds: userIdArray,
          title: data.title,
          body: data.body,
          url: data.url || "/",
          notificationType: data.notificationType,
        }),
        {
          successMessage: result =>
            `通知送信完了: 成功 ${result.success}件, 失敗 ${result.failed}件`,
          errorTitle: "送信エラー",
        },
      );

      if (result) {
        if (result.errors.length > 0) {
          console.error("送信エラー:", result.errors);
        }
        reset();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <Text fontSize="xl" fontWeight="bold">
          プッシュ通知送信
        </Text>
      </CardHeader>
      <CardBody>
        <VStack as="form" onSubmit={handleSubmit(onSubmit)} gap={6}>
          <FormControl
            label="タイトル"
            isInvalid={!!errors.title}
            errorMessage={errors.title?.message}
            isRequired
            requiredIndicator={
              <Tag size="sm" colorScheme="danger" ms={2}>
                必須
              </Tag>
            }
          >
            <Input placeholder="通知のタイトルを入力" {...register("title")} />
          </FormControl>

          <FormControl
            label="本文"
            isInvalid={!!errors.body}
            errorMessage={errors.body?.message}
            isRequired
            requiredIndicator={
              <Tag size="sm" colorScheme="danger" ms={2}>
                必須
              </Tag>
            }
          >
            <Textarea
              placeholder="通知の本文を入力"
              rows={4}
              {...register("body")}
            />
          </FormControl>

          <FormControl
            label="リンク先URL"
            helperMessage="通知をクリックした時の遷移先（省略可）"
          >
            <Input placeholder="/notifications" {...register("url")} />
          </FormControl>

          <FormControl
            label="通知タイプ"
            helperMessage="ユーザーの通知設定に応じてフィルタされます"
          >
            <Controller
              name="notificationType"
              control={control}
              render={({ field }) => (
                <Select {...field} items={notificationTypeItems} />
              )}
            />
          </FormControl>

          <FormControl label="送信先">
            <Controller
              name="recipientType"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field}>
                  <VStack align="start">
                    <Radio value="all">全ユーザー</Radio>
                    <Radio value="selected">選択したユーザー</Radio>
                  </VStack>
                </RadioGroup>
              )}
            />
          </FormControl>

          {recipientType === "selected" && (
            <FormControl
              label="対象ユーザーID"
              helperMessage="複数のユーザーIDをカンマ区切りで入力してください"
              isInvalid={!!errors.userIds}
              errorMessage={errors.userIds?.message}
            >
              <Textarea
                placeholder="ユーザーIDをカンマ区切りで入力（例: user1,user2,user3）"
                rows={3}
                {...register("userIds")}
              />
            </FormControl>
          )}

          <Divider />

          <HStack justifyContent="flex-end" w="full">
            <Button
              type="submit"
              colorScheme="blue"
              loading={isPending}
              size="lg"
            >
              通知を送信
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
