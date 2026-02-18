export const APP_ERROR_PREFIX = "APP_ERROR";

export const APP_ERROR_CODES = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

type ParsedAppError = {
  code: AppErrorCode;
  message: string;
};

const toSerializedMessage = (code: AppErrorCode, message: string) =>
  `${APP_ERROR_PREFIX}:${code}:${message}`;

const isAppErrorCode = (value: string): value is AppErrorCode =>
  APP_ERROR_CODES.includes(value as AppErrorCode);

export const parseAppError = (error: unknown): ParsedAppError | null => {
  const rawMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : null;

  if (!rawMessage || !rawMessage.startsWith(`${APP_ERROR_PREFIX}:`)) {
    return null;
  }

  const [, code, ...rest] = rawMessage.split(":");
  if (!code || !isAppErrorCode(code)) {
    return null;
  }

  return {
    code,
    message: rest.join(":") || "エラーが発生しました",
  };
};

export class HttpError extends Error {
  readonly code: AppErrorCode;
  readonly statusCode: number;
  readonly publicMessage: string;

  constructor({
    code,
    statusCode,
    message,
    cause,
  }: {
    code: AppErrorCode;
    statusCode: number;
    message: string;
    cause?: unknown;
  }) {
    super(toSerializedMessage(code, message), cause ? { cause } : undefined);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.publicMessage = message;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "リクエストが正しくありません") {
    super({
      code: "BAD_REQUEST",
      statusCode: 400,
      message,
    });
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "認証が必要です") {
    super({
      code: "UNAUTHORIZED",
      statusCode: 401,
      message,
    });
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "この操作を実行する権限がありません") {
    super({
      code: "FORBIDDEN",
      statusCode: 403,
      message,
    });
  }
}

export class NotFoundError extends HttpError {
  constructor(resource = "リソース") {
    super({
      code: "NOT_FOUND",
      statusCode: 404,
      message: `${resource}が見つかりません`,
    });
  }
}

export class ConflictError extends HttpError {
  constructor(message = "競合が発生しました") {
    super({
      code: "CONFLICT",
      statusCode: 409,
      message,
    });
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "サーバー内部エラーが発生しました", cause?: unknown) {
    super({
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message,
      cause,
    });
  }
}
