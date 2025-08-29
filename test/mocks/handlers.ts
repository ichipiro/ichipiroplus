import { http, HttpResponse } from "msw";

// APIモックハンドラー
export const handlers = [
  // ユーザー情報取得
  http.get("/api/user/me", () => {
    return HttpResponse.json({
      id: "test-user-id",
      email: "test@hiroshima-cu.ac.jp",
      name: "Test User",
      isProfileComplete: true,
    });
  }),

  // タスク一覧取得
  http.get("/api/tasks", () => {
    return HttpResponse.json([
      {
        id: "task1",
        title: "レポート提出",
        description: "プログラミング基礎のレポート",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-12-31",
      },
      {
        id: "task2",
        title: "中間テスト勉強",
        description: "数学の中間テスト",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: "2024-11-15",
      },
    ]);
  }),

  // タスク作成
  http.post("/api/tasks", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: "new-task-id",
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  // 講義一覧取得
  http.get("/api/lectures", () => {
    return HttpResponse.json([
      {
        id: "lec1",
        name: "プログラミング基礎",
        syllabusCode: "CS101",
        instructor: "山田太郎",
        room: "A101",
        schedules: [
          { day: 1, time: 1 },
          { day: 3, time: 2 },
        ],
      },
    ]);
  }),
];
