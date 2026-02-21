"use server";

import { auth } from "@/lib/auth";
import {
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { webpush } from "@/lib/webpush";
import type { NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type {
  NotificationSettingsUpdateRequest,
  PushSubscriptionInfo,
  PushSubscriptionRequest,
  PushSubscriptionResponse,
  TestNotificationRequest,
  TestNotificationResponse,
} from "../types";

/**
 * サーバーに通知サブスクリプションを登録する
 */
export const registerPushSubscription = async (
  subscription: PushSubscriptionRequest,
): Promise<PushSubscriptionResponse> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  try {
    const pushSubscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        taskReminders: subscription.task_reminders ?? true,
        lectureStarts: subscription.lecture_starts ?? true,
        systemNotices: subscription.system_notices ?? true,
      },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        taskReminders: subscription.task_reminders ?? true,
        lectureStarts: subscription.lecture_starts ?? true,
        systemNotices: subscription.system_notices ?? true,
      },
    });

    revalidatePath("/settings/notifications");

    return {
      success: true,
      created: true,
      subscription: {
        id: pushSubscription.id,
        endpoint: pushSubscription.endpoint,
        task_reminders: pushSubscription.taskReminders,
        lecture_starts: pushSubscription.lectureStarts,
        system_notices: pushSubscription.systemNotices,
        created_at: pushSubscription.createdAt.toISOString(),
        updated_at: pushSubscription.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Push subscription registration error:", error);
    throw new InternalServerError(
      "通知サブスクリプションの登録に失敗しました",
      error,
    );
  }
};

/**
 * 通知設定を取得する
 */
export const getNotificationSettings = async (): Promise<
  PushSubscriptionInfo[]
> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscriptions.map(sub => ({
    id: sub.id,
    endpoint: sub.endpoint,
    task_reminders: sub.taskReminders,
    lecture_starts: sub.lectureStarts,
    system_notices: sub.systemNotices,
    created_at: sub.createdAt.toISOString(),
    updated_at: sub.updatedAt.toISOString(),
  }));
};

/**
 * 通知設定を更新する
 */
export const updateNotificationSettings = async (
  id: string,
  settings: NotificationSettingsUpdateRequest,
): Promise<{ success: boolean }> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  try {
    await prisma.pushSubscription.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        taskReminders: settings.task_reminders,
        lectureStarts: settings.lecture_starts,
        systemNotices: settings.system_notices,
      },
    });

    revalidatePath("/settings/notifications");

    return { success: true };
  } catch (error) {
    console.error("Notification settings update error:", error);
    throw new InternalServerError("通知設定の更新に失敗しました", error);
  }
};

/**
 * 通知サブスクリプションを解除する
 */
export const unregisterPushSubscription = async (
  id: string,
): Promise<{ success: boolean }> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  try {
    await prisma.pushSubscription.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/settings/notifications");

    return { success: true };
  } catch (error) {
    console.error("Push subscription unregister error:", error);
    throw new InternalServerError(
      "通知サブスクリプションの解除に失敗しました",
      error,
    );
  }
};

/**
 * テスト通知を送信する
 */
export const sendTestNotification = async (
  request: TestNotificationRequest,
): Promise<TestNotificationResponse> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  try {
    const result = await sendPushNotification({
      userId: session.user.id,
      title: request.title || "テスト通知",
      body: request.body || "これはテスト通知です",
      url: request.url || "/",
      notificationType: "test",
    });

    return {
      success: result.success > 0,
      sent: result.success,
      errors: result.errors.length > 0 ? result.errors : null,
    };
  } catch (error) {
    console.error("Test notification error:", error);
    return {
      success: false,
      sent: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
};

/**
 * プッシュ通知を送信するユーティリティ関数
 */
interface SendPushNotificationParams {
  userId: string;
  title: string;
  body: string;
  url?: string;
  notificationType: NotificationType;
}

export const sendPushNotification = async ({
  userId,
  title,
  body,
  url = "/",
  notificationType,
}: SendPushNotificationParams): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> => {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  try {
    // ユーザーの通知設定に応じてサブスクリプションをフィルタリング
    const whereClause: Record<string, boolean | string> = { userId };

    if (notificationType === "task") {
      whereClause.taskReminders = true;
    } else if (notificationType === "lecture") {
      whereClause.lectureStarts = true;
    } else if (notificationType === "system") {
      whereClause.systemNotices = true;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause,
    });

    if (subscriptions.length === 0) {
      results.errors.push("No active subscriptions found");
      return results;
    }

    // 送信するデータ
    const payload = JSON.stringify({
      title,
      body,
      url,
      type: notificationType,
      timestamp: Date.now(),
    });

    // 各サブスクリプションに通知を送信
    for (const subscription of subscriptions) {
      try {
        const subscriptionInfo = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        await webpush.sendNotification(subscriptionInfo, payload);
        results.success += 1;

        // 成功ログを保存
        await prisma.pushNotificationLog.create({
          data: {
            userId,
            title,
            body,
            url,
            notificationType,
            status: "sent",
          },
        });
      } catch (error) {
        console.error("Web push error:", error);
        results.failed += 1;

        const errorMsg =
          error instanceof Error ? error.message : "Unknown push error";
        results.errors.push(errorMsg);

        // 無効なサブスクリプションの場合は削除
        if (error) {
          await prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
          results.errors.push(
            `Invalid subscription removed: ${subscription.endpoint.slice(
              0,
              50,
            )}...`,
          );
        }

        // エラーログを保存
        await prisma.pushNotificationLog.create({
          data: {
            userId,
            title,
            body,
            url,
            notificationType,
            status: "failed",
          },
        });
      }
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Push notification processing error";
    results.errors.push(errorMsg);
    console.error("Push notification processing error:", errorMsg);
  }

  return results;
};

type LectureSlot = {
  day: number;
  time: number;
};

interface TriggerLectureStartNotificationsParams {
  now?: Date;
}

const SLOT_TIME_BY_LABEL: Record<string, number> = {
  "09:00": 1,
  "10:40": 2,
  "13:00": 3,
  "14:40": 4,
  "16:20": 5,
};

const WEEKDAY_BY_SHORT_LABEL: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
};

const resolveCurrentLectureSlotInTokyo = (now: Date): LectureSlot | null => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find(part => part.type === "weekday")?.value;
  const hour = parts.find(part => part.type === "hour")?.value;
  const minute = parts.find(part => part.type === "minute")?.value;

  if (!weekday || !hour || !minute) {
    return null;
  }

  const day = WEEKDAY_BY_SHORT_LABEL[weekday];
  const time = SLOT_TIME_BY_LABEL[`${hour}:${minute}`];

  if (!day || !time) {
    return null;
  }

  return { day, time };
};

/**
 * 現在時刻(Asia/Tokyo)の講義コマに応じて講義開始通知を送信する
 * 外部ワーカーやCronジョブからの呼び出しを想定
 */
export const triggerLectureStartNotifications = async ({
  now = new Date(),
}: TriggerLectureStartNotificationsParams = {}) => {
  const slot = resolveCurrentLectureSlotInTokyo(now);

  if (!slot) {
    return {
      success: 0,
      failed: 0,
      errors: ["No lecture slot matched for current time in Asia/Tokyo"],
      notifiedUsers: 0,
      slot: null,
    };
  }

  const activeTerm = await prisma.term.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: {
      id: true,
      number: true,
      name: true,
    },
  });

  if (!activeTerm) {
    return {
      success: 0,
      failed: 0,
      errors: ["No active term found for current timestamp"],
      notifiedUsers: 0,
      slot,
    };
  }

  const registrations = await prisma.registration.findMany({
    where: {
      lecture: {
        isPublic: true,
        schedules: { some: { day: slot.day, time: slot.time } },
        lectureTerms: { some: { termNumber: activeTerm.number } },
      },
      user: {
        subscriptions: {
          some: {
            lectureStarts: true,
          },
        },
      },
    },
    select: {
      userId: true,
      lecture: {
        select: {
          name: true,
        },
      },
    },
  });

  const groupedLectureNames = new Map<string, Set<string>>();

  for (const registration of registrations) {
    const lectureNames =
      groupedLectureNames.get(registration.userId) ?? new Set<string>();
    lectureNames.add(registration.lecture.name);
    groupedLectureNames.set(registration.userId, lectureNames);
  }

  const minuteStart = new Date(now);
  minuteStart.setSeconds(0, 0);
  const minuteEnd = new Date(minuteStart);
  minuteEnd.setMinutes(minuteEnd.getMinutes() + 1);

  const totals = { success: 0, failed: 0, errors: [] as string[] };

  for (const [userId, lectureNames] of groupedLectureNames.entries()) {
    const alreadySent = await prisma.pushNotificationLog.findFirst({
      where: {
        userId,
        notificationType: "lecture",
        status: "sent",
        sentAt: {
          gte: minuteStart,
          lt: minuteEnd,
        },
      },
      select: { id: true },
    });

    if (alreadySent) {
      continue;
    }

    const lectureNameList = Array.from(lectureNames);
    const title =
      lectureNameList.length > 1
        ? "講義開始のお知らせ（複数）"
        : "講義開始のお知らせ";
    const body =
      lectureNameList.length > 1
        ? `${lectureNameList[0]} ほか${lectureNameList.length - 1}件が開始です`
        : `${lectureNameList[0]} が開始です`;

    const dayTime = (slot.day - 1) * 5 + slot.time;
    const url = `/timetable/${activeTerm.id}/${dayTime}`;

    const result = await sendPushNotification({
      userId,
      title,
      body,
      url,
      notificationType: "lecture",
    });

    totals.success += result.success;
    totals.failed += result.failed;
    totals.errors.push(...result.errors);
  }

  return {
    ...totals,
    notifiedUsers: groupedLectureNames.size,
    slot,
    term: activeTerm,
  };
};

/**
 * 複数ユーザーに通知を送信する（管理者向け）
 */
interface SendBulkNotificationParams {
  userIds?: string[];
  allUsers?: boolean;
  title: string;
  body: string;
  url?: string;
  notificationType: NotificationType;
}

export const sendBulkPushNotification = async ({
  userIds = [],
  allUsers = false,
  title,
  body,
  url = "/",
  notificationType,
}: SendBulkNotificationParams): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  // 管理者チェック
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    throw new ForbiddenError("管理者権限が必要です");
  }

  let targetUserIds: string[] = [];

  if (allUsers) {
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    targetUserIds = users.map(u => u.id);
  } else {
    targetUserIds = userIds;
  }

  const totalResults = { success: 0, failed: 0, errors: [] as string[] };

  // 各ユーザーに通知を送信
  for (const userId of targetUserIds) {
    try {
      const result = await sendPushNotification({
        userId,
        title,
        body,
        url,
        notificationType,
      });

      totalResults.success += result.success;
      totalResults.failed += result.failed;
      totalResults.errors.push(...result.errors);
    } catch (error) {
      totalResults.failed += 1;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      totalResults.errors.push(`User ${userId}: ${errorMsg}`);
    }
  }

  return totalResults;
};
