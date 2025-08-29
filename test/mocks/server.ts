import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// テスト用のMSWサーバー
export const server = setupServer(...handlers);