/**
 * プッシュ通知関連の型定義
 */

/**
 * プッシュ通知サブスクリプション設定
 */
export interface NotificationSettings {
  taskReminders: boolean;
  lectureStarts: boolean;
  systemNotices: boolean;
}

/**
 * プッシュ通知サブスクリプション情報
 */
export interface PushSubscriptionInfo {
  id: string;
  endpoint: string;
  task_reminders: boolean;
  lecture_starts: boolean;
  system_notices: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * プッシュ通知登録リクエスト
 */
export interface PushSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  task_reminders?: boolean;
  lecture_starts?: boolean;
  system_notices?: boolean;
}

/**
 * プッシュ通知登録レスポンス
 */
export interface PushSubscriptionResponse {
  success: boolean;
  created: boolean;
  subscription: PushSubscriptionInfo;
}

/**
 * 通知設定更新リクエスト
 */
export interface NotificationSettingsUpdateRequest {
  endpoint: string;
  task_reminders?: boolean;
  lecture_starts?: boolean;
  system_notices?: boolean;
}

/**
 * テスト通知リクエスト
 */
export interface TestNotificationRequest {
  title?: string;
  body?: string;
  url?: string;
}

/**
 * テスト通知レスポンス
 */
export interface TestNotificationResponse {
  success: boolean;
  sent: number;
  errors: string[] | null;
}

/**
 * サブスクリプション状態
 */
export interface SubscriptionState {
  isSubscribed: boolean;
  settings: NotificationSettings | null;
}
