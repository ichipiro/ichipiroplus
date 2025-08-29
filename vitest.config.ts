import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        ".next/",
        "*.config.*",
        "**/*.d.ts",
        "**/*.stories.tsx",
        "**/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/test": path.resolve(__dirname, "./test"),
      "next/server": path.resolve(__dirname, "./node_modules/next/dist/server/next.js"),
    },
  },
});