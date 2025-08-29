import { render, type RenderOptions } from "@testing-library/react";
import { UIProvider } from "@yamada-ui/react";
import { config, theme } from "@/theme";
import type { ReactElement } from "react";

// カスタムレンダー関数
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <UIProvider theme={theme} config={config}>
        {children}
      </UIProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// re-export everything
export * from "@testing-library/react";
export { customRender as render };

// テスト用のモックデータ生成ヘルパー
export const createMockUser = (overrides?: Partial<any>) => ({
  id: "test-user-id",
  email: "test@hiroshima-cu.ac.jp",
  name: "Test User",
  username: "testuser",
  displayName: "Test User",
  isProfileComplete: true,
  ...overrides,
});

export const createMockTask = (overrides?: Partial<any>) => ({
  id: "test-task-id",
  title: "Test Task",
  description: "Test Description",
  status: "TODO",
  priority: "MEDIUM",
  userId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockLecture = (overrides?: Partial<any>) => ({
  id: "test-lecture-id",
  name: "Test Lecture",
  syllabusCode: "TEST001",
  instructor: "Test Instructor",
  room: "A101",
  schedules: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});