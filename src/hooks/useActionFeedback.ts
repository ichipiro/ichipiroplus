import { parseAppError } from "@/lib/errors";
import { useNotice } from "@yamada-ui/react";

const useActionFeedback = () => {
  const notice = useNotice({ isClosable: true });

  const showSuccess = (message: string, title = "成功") => {
    notice({
      title,
      description: message,
      status: "success",
    });
  };

  const showError = (error: unknown, title = "エラー") => {
    const parsed = parseAppError(error);
    if (parsed) {
      if (
        parsed.code === "BAD_REQUEST" ||
        parsed.code === "CONFLICT" ||
        parsed.code === "NOT_FOUND" ||
        parsed.code === "FORBIDDEN"
      ) {
        notice({
          title,
          description: parsed.message,
          status: "warning",
        });
        return;
      }

      throw error;
    }

    // 通常のErrorは通知で表示
    const errorMessage =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    notice({
      title,
      description: errorMessage,
      status: "error",
    });
  };

  const withFeedback = async <T>(
    promise: Promise<T>,
    options: {
      successTitle?: string;
      successMessage?: string | ((data: T) => string);
      errorTitle?: string;
    } = {},
  ): Promise<T | undefined> => {
    try {
      const result = await promise;

      if (options.successMessage) {
        const message =
          typeof options.successMessage === "function"
            ? options.successMessage(result)
            : options.successMessage;

        showSuccess(message, options.successTitle);
      }

      return result;
    } catch (error) {
      showError(error, options.errorTitle);
    }
  };

  return {
    showSuccess,
    showError,
    withFeedback,
  };
};

export default useActionFeedback;
