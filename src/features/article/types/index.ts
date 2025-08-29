import type { Article } from "@prisma/client";

export type { Article };

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ArticleFormData {
  title: string;
  content: string;
  isPublished?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
