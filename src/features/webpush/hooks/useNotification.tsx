"use client";

import { useNotice } from "@yamada-ui/react";
import { useCallback, useEffect, useReducer } from "react";
import {
  getNotificationSettings,
  registerPushSubscription,
  sendTestNotification,
  unregisterPushSubscription,
  updateNotificationSettings,
} from "../actions";
import type { NotificationSettings, SubscriptionState } from "../types";
import {
  formatSubscriptionForApi,
  getOrCreatePushSubscription,
  requestNotificationPermission,
  showLocalNotificationViaServiceWorker,
  unsubscribeFromBrowser,
} from "../utils";

/**
 * 通知設定を管理するためのカスタムフック
 */
type NotificationHookState = {
  isSupported: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  subscriptionState: SubscriptionState;
};

type NotificationHookAction =
  | { type: "setInitialization"; payload: Partial<NotificationHookState> }
  | { type: "setProcessing"; payload: boolean }
  | { type: "setPermission"; payload: NotificationPermission }
  | { type: "setSubscription"; payload: PushSubscription | null }
  | { type: "setSubscriptionState"; payload: SubscriptionState };

const initialState: NotificationHookState = {
  isSupported: false,
  isLoading: true,
  isProcessing: false,
  permission: "default",
  subscription: null,
  subscriptionState: {
    isSubscribed: false,
    settings: null,
  },
};

const notificationReducer = (
  state: NotificationHookState,
  action: NotificationHookAction,
): NotificationHookState => {
  switch (action.type) {
    case "setInitialization":
      return { ...state, ...action.payload };
    case "setProcessing":
      return { ...state, isProcessing: action.payload };
    case "setPermission":
      return { ...state, permission: action.payload };
    case "setSubscription":
      return { ...state, subscription: action.payload };
    case "setSubscriptionState":
      return { ...state, subscriptionState: action.payload };
    default:
      return state;
  }
};

export function useNotification() {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // 通知表示用
  const notice = useNotice();

  // 初期化: ブラウザのサポート状況と現在の設定を確認
  /**
   * 現在のサブスクリプション状態を確認する
   */
  const checkSubscriptionState = useCallback(async () => {
    try {
      // ブラウザ側のサブスクリプションを取得
      const browserSubscription = await getOrCreatePushSubscription();

      if (!browserSubscription) {
        dispatch({
          type: "setSubscriptionState",
          payload: {
            isSubscribed: false,
            settings: null,
          },
        });
        dispatch({
          type: "setSubscription",
          payload: null,
        });
        return;
      }

      dispatch({
        type: "setSubscription",
        payload: browserSubscription,
      });

      // サーバー側のサブスクリプション設定を取得
      const serverSubscriptions = await getNotificationSettings();

      // 現在のエンドポイントに一致するサブスクリプションを検索
      const matchingSubscription = serverSubscriptions.find(
        sub => sub.endpoint === browserSubscription.endpoint,
      );

      if (!matchingSubscription) {
        dispatch({
          type: "setSubscriptionState",
          payload: {
            isSubscribed: false,
            settings: null,
          },
        });
        return;
      }

      // サブスクリプションが存在する場合は設定を返す
      dispatch({
        type: "setSubscriptionState",
        payload: {
          isSubscribed: true,
          settings: {
            taskReminders: matchingSubscription.task_reminders,
            lectureStarts: matchingSubscription.lecture_starts,
            systemNotices: matchingSubscription.system_notices,
          },
        },
      });
    } catch (error) {
      console.error("サブスクリプション状態の確認エラー:", error);
      dispatch({
        type: "setSubscriptionState",
        payload: {
          isSubscribed: false,
          settings: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        // ブラウザのサポート状況をチェック
        const supported =
          "Notification" in window &&
          "serviceWorker" in navigator &&
          "PushManager" in window;

        if (!supported) {
          dispatch({
            type: "setInitialization",
            payload: {
              isSupported: false,
              isLoading: false,
              permission: "default",
            },
          });
          return;
        }

        dispatch({
          type: "setInitialization",
          payload: {
            isSupported: supported,
            permission: Notification.permission,
          },
        });

        // 現在のサブスクリプション状態を取得
        await checkSubscriptionState();
      } catch (error) {
        console.error("通知初期化エラー:", error);
      } finally {
        dispatch({ type: "setInitialization", payload: { isLoading: false } });
      }
    }

    initialize();
  }, [checkSubscriptionState]);

  /**
   * 通知の有効/無効を切り替える
   */
  const toggleNotifications = async (
    settings?: NotificationSettings,
  ): Promise<boolean> => {
    if (!state.isSupported || state.isProcessing) return false;

    dispatch({ type: "setProcessing", payload: true });

    try {
      if (!state.subscriptionState.isSubscribed) {
        const permissionResult = await requestNotificationPermission();
        dispatch({ type: "setPermission", payload: permissionResult });

        if (permissionResult !== "granted") {
          return false;
        }

        const newSubscription = await getOrCreatePushSubscription();
        if (!newSubscription) {
          throw new Error("サブスクリプションの作成に失敗しました");
        }

        const subscriptionData = formatSubscriptionForApi(
          newSubscription,
          settings,
        );
        const response = await registerPushSubscription(subscriptionData);

        dispatch({ type: "setSubscription", payload: newSubscription });
        dispatch({
          type: "setSubscriptionState",
          payload: {
            isSubscribed: true,
            settings: {
              taskReminders: response.subscription.task_reminders,
              lectureStarts: response.subscription.lecture_starts,
              systemNotices: response.subscription.system_notices,
            },
          },
        });

        notice({
          title: "通知設定",
          description: "プッシュ通知が有効になりました",
          status: "success",
        });

        return true;
      }

      if (!state.subscription) {
        return false;
      }

      // サーバーからサブスクリプション情報を取得して正しいIDを見つける
      const serverSubscriptions = await getNotificationSettings();
      const matchingSubscription = serverSubscriptions.find(
        sub => sub.endpoint === state.subscription?.endpoint,
      );

      if (!matchingSubscription) {
        throw new Error("サブスクリプションが見つかりませんでした");
      }

      const response = await unregisterPushSubscription(
        matchingSubscription.id,
      );

      if (!response.success) {
        throw new Error("サーバーからのサブスクリプション削除に失敗しました");
      }

      await unsubscribeFromBrowser(state.subscription);

      dispatch({ type: "setSubscription", payload: null });
      dispatch({
        type: "setSubscriptionState",
        payload: {
          isSubscribed: false,
          settings: null,
        },
      });

      notice({
        title: "通知設定",
        description: "プッシュ通知を無効にしました",
        status: "info",
      });

      return true;
    } catch (error) {
      console.error("通知設定の変更に失敗しました:", error);
      notice({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "通知設定の変更に失敗しました",
        status: "error",
      });
      return false;
    } finally {
      dispatch({ type: "setProcessing", payload: false });
    }
  };

  /**
   * 通知設定を更新する
   */
  const updateSettings = async (
    newSettings: Partial<NotificationSettings>,
  ): Promise<boolean> => {
    if (
      !state.isSupported ||
      !state.subscription ||
      !state.subscriptionState.isSubscribed ||
      state.isProcessing
    ) {
      return false;
    }

    dispatch({ type: "setProcessing", payload: true });

    try {
      // サーバーからサブスクリプション情報を取得して正しいIDを見つける
      const serverSubscriptions = await getNotificationSettings();
      const matchingSubscription = serverSubscriptions.find(
        sub => sub.endpoint === state.subscription?.endpoint,
      );

      if (!matchingSubscription) {
        throw new Error("サブスクリプションが見つかりませんでした");
      }

      const response = await updateNotificationSettings(
        matchingSubscription.id,
        {
          task_reminders: newSettings.taskReminders,
          lecture_starts: newSettings.lectureStarts,
          system_notices: newSettings.systemNotices,
          endpoint: "",
        },
      );

      if (response.success) {
        dispatch({
          type: "setSubscriptionState",
          payload: {
            isSubscribed: true,
            settings: {
              taskReminders:
                newSettings.taskReminders ??
                state.subscriptionState.settings?.taskReminders ??
                false,
              lectureStarts:
                newSettings.lectureStarts ??
                state.subscriptionState.settings?.lectureStarts ??
                false,
              systemNotices:
                newSettings.systemNotices ??
                state.subscriptionState.settings?.systemNotices ??
                false,
            },
          },
        });

        notice({
          title: "通知設定",
          description: "通知設定を更新しました",
          status: "success",
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("通知設定の更新に失敗しました:", error);
      notice({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "通知設定の更新に失敗しました",
        status: "error",
      });
      return false;
    } finally {
      dispatch({ type: "setProcessing", payload: false });
    }
  };

  /**
   * テスト通知を送信する
   */
  const sendTestNotifications = async (
    title: string,
    body: string,
  ): Promise<boolean> => {
    if (
      !state.isSupported ||
      !state.subscriptionState.isSubscribed ||
      state.isProcessing
    ) {
      return false;
    }

    dispatch({ type: "setProcessing", payload: true });

    try {
      const response = await sendTestNotification({ title, body });

      if (response.success) {
        notice({
          title: "通知テスト",
          description: `テスト通知を送信しました (${response.sent}件)`,
          status: "success",
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("テスト通知の送信に失敗しました:", error);
      notice({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "テスト通知の送信に失敗しました",
        status: "error",
      });
      return false;
    } finally {
      dispatch({ type: "setProcessing", payload: false });
    }
  };

  /**
   * ローカル通知を表示する
   */
  const showLocalNotification = async (
    title: string,
    body: string,
    url?: string,
  ): Promise<boolean> => {
    if (
      !state.isSupported ||
      state.permission !== "granted" ||
      state.isProcessing
    ) {
      return false;
    }

    dispatch({ type: "setProcessing", payload: true });

    try {
      const success = await showLocalNotificationViaServiceWorker(
        title,
        body,
        url,
      );

      if (success) {
        notice({
          title: "通知テスト",
          description: "ローカル通知を表示しました",
          status: "success",
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("ローカル通知の表示に失敗しました:", error);
      notice({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "ローカル通知の表示に失敗しました",
        status: "error",
      });
      return false;
    } finally {
      dispatch({ type: "setProcessing", payload: false });
    }
  };

  return {
    isSupported: state.isSupported,
    isLoading: state.isLoading,
    isProcessing: state.isProcessing,
    permission: state.permission,
    isSubscribed: state.subscriptionState.isSubscribed,
    settings: state.subscriptionState.settings,

    toggleNotifications,
    updateSettings,
    sendTestNotifications,
    showLocalNotification,
  };
}
