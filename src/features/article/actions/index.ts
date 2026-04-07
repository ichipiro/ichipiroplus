"use server";

import { auth } from "@/lib/auth";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getMe } from "@/features/user/actions";
import type { Article } from "@prisma/client";
import type { ArticleFormData, ArticlesResponse } from "../types";

/**
 * 記事一覧を取得（公開済みのみ）
 */
export const getArticles = async (
  page = 1,
  limit = 10,
): Promise<ArticlesResponse> => {
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.article.count({
      where: { isPublished: true },
    }),
  ]);

  return {
    articles,
    total,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

/**
 * 記事詳細を取得
 */
export const getArticle = async (id: string): Promise<Article> => {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new NotFoundError("記事");
  }
  return article;
};

/**
 * ユーザーの記事一覧を取得
 */
export const getUserArticles = async (
  userId: string,
  includeUnpublished = false,
): Promise<Article[]> => {
  return await prisma.article.findMany({
    where: {
      userId,
      ...(includeUnpublished ? {} : { isPublished: true }),
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * 自分の記事一覧を取得
 */
export const getMyArticles = async (): Promise<Article[]> => {
  const userId = await getMe();

  return await prisma.article.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * 記事を作成
 */
export const createArticle = async (
  data: ArticleFormData,
): Promise<Article> => {
  const userId = await getMe();

  const article = await prisma.article.create({
    data: {
      title: data.title,
      content: data.content,
      isPublished: data.isPublished ?? false,
      userId,
    },
  });
  return article;
};

/**
 * 記事を更新
 */
export const updateArticle = async (
  id: string,
  data: Partial<ArticleFormData>,
): Promise<Article> => {
  const userId = await getMe();

  // 所有者チェック
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    throw new ForbiddenError("この記事を編集する権限がありません");
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...data,
    },
  });

  return article;
};

/**
 * 記事を削除
 */
export const deleteArticle = async (id: string): Promise<void> => {
  const userId = await getMe();

  // 所有者チェック込みで削除
  await prisma.article.deleteMany({
    where: {
      id,
      userId,
    },
  });
};

/**
 * 画像をアップロード（MinIO）
 */

export const uploadImage = async (data: {
  base64: string;
  filename: string;
  contentType: string;
  size: number;
}): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  // ファイルサイズチェック（5MB）
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (data.size > MAX_FILE_SIZE) {
    throw new BadRequestError("ファイルサイズは5MB以下にしてください");
  }

  // ファイルタイプチェック
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(data.contentType)) {
    throw new BadRequestError("対応していないファイル形式です");
  }

  try {
    // Base64をバッファに変換
    const base64Data = data.base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // ユニークなファイル名を生成
    const timestamp = Date.now();
    const sanitizedFileName = data.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `uploads/${session.user.id}/${timestamp}-${sanitizedFileName}`;

    // MinIOにアップロード
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: data.contentType,
      }),
    );

    const useSsl = process.env.S3_USE_SSL === "true";
    let publicBaseUrl = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "") ?? "";

    if (
      useSsl &&
      publicBaseUrl &&
      !publicBaseUrl.startsWith("http://") &&
      !publicBaseUrl.startsWith("https://")
    ) {
      publicBaseUrl = `https://${publicBaseUrl}`;
    }

    return `${publicBaseUrl}/${key}`;
  } catch (error) {
    console.error("Failed to upload image - detailed error:", error);
    if (error instanceof Error) {
      throw new InternalServerError(
        `画像のアップロードに失敗しました: ${error.message}`,
        error,
      );
    }
    throw new InternalServerError("画像のアップロードに失敗しました", error);
  }
};
