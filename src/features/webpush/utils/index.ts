/**
 * WebPushブラウザ側の機能
 */

/**
 * サービスワーカーを登録する
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("プッシュ通知はこのブラウザでサポートされていません");
    return null;
  }

  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("サービスワーカーの登録に失敗しました:", error);
    return null;
  }
}

/**
 * 通知許可を要求する
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("このブラウザは通知をサポートしていません");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    console.warn("通知はブロックされています");
    return "denied";
  }

  // 許可を要求
  return await Notification.requestPermission();
}

/**
 * プッシュサブスクリプションを取得または作成する
 */
export async function getOrCreatePushSubscription(): Promise<PushSubscription | null> {
  const serviceWorkerRegistration = await registerServiceWorker();

  if (!serviceWorkerRegistration) {
    return null;
  }

  try {
    // 既存のサブスクリプションをチェック
    let subscription =
      await serviceWorkerRegistration.pushManager.getSubscription();

    // 既存のサブスクリプションがなければ新規作成
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_KEY || "",
      );
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });
    }

    return subscription;
  } catch (error) {
    console.error("プッシュサブスクリプションの作成に失敗しました:", error);
    return null;
  }
}

/**
 * ブラウザサブスクリプションを削除
 */
export async function unsubscribeFromBrowser(
  subscription: PushSubscription,
): Promise<boolean> {
  try {
    await subscription.unsubscribe();
    return true;
  } catch (error) {
    console.error("ブラウザのサブスクリプション解除エラー:", error);
    return false;
  }
}

/**
 * Service Workerからローカル通知を表示する
 */
export async function showLocalNotificationViaServiceWorker(
  title: string,
  body: string,
  url = "/",
): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;

    if (!registration.active) {
      throw new Error("アクティブなService Workerが見つかりません");
    }

    registration.active.postMessage({
      type: "SHOW_TEST_NOTIFICATION",
      title,
      body,
      url,
    });

    return true;
  } catch (error) {
    console.error("ローカル通知の表示エラー:", error);
    return false;
  }
}

/**
 * Base64文字列をUint8Arrayに変換する
 * (VAPID公開鍵をPushManagerで使用できる形式に変換)
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * ArrayBufferをBase64文字列に変換する
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const binary = new Uint8Array(buffer).reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    "",
  );
  return window.btoa(binary);
}

/**
 * サブスクリプション情報をAPIに送信可能な形式に変換
 */
export function formatSubscriptionForApi(
  subscription: PushSubscription,
  settings?: {
    taskReminders?: boolean;
    lectureStarts?: boolean;
    systemNotices?: boolean;
  },
) {
  // サブスクリプション情報をフォーマット
  const subscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey("p256dh") as ArrayBuffer),
      auth: arrayBufferToBase64(subscription.getKey("auth") as ArrayBuffer),
    },
  };

  // オプション設定があれば追加
  if (settings) {
    if (settings.taskReminders !== undefined) {
      Object.assign(subscriptionData, {
        task_reminders: settings.taskReminders,
      });
    }
    if (settings.lectureStarts !== undefined) {
      Object.assign(subscriptionData, {
        lecture_starts: settings.lectureStarts,
      });
    }
    if (settings.systemNotices !== undefined) {
      Object.assign(subscriptionData, {
        system_notices: settings.systemNotices,
      });
    }
  }

  return subscriptionData;
}
