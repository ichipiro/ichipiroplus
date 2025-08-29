/**
 * HTTP Error Classes
 * Server Actions / RSC で throw して error.tsx でキャッチする
 */

export abstract class HttpError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

/**
 * 400 Bad Request - バリデーションエラー
 */
export class BadRequestError extends HttpError {
  readonly statusCode = 400;

  constructor(message = "リクエストが正しくありません") {
    super(message);
  }
}

/**
 * 401 Unauthorized - 認証エラー
 */
export class UnauthorizedError extends HttpError {
  readonly statusCode = 401;

  constructor(message = "認証が必要です") {
    super(message);
  }
}

/**
 * 404 Not Found - リソース不存在
 */
export class NotFoundError extends HttpError {
  readonly statusCode = 404;

  constructor(resource = "リソース") {
    super(`${resource}が見つかりません`);
  }
}

/**
 * 500 Internal Server Error - サーバーエラー
 */
export class InternalServerError extends HttpError {
  readonly statusCode = 500;

  constructor(message = "サーバー内部エラーが発生しました") {
    super(message);
  }
}
