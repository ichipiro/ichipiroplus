# Data Flow

## 典型フロー

1. Page (Server Component) で初期データを取得する。
2. Client Component から Server Action を呼ぶ。
3. Action で Prisma を実行する。
4. 返却値で UI を更新する。

## 主要データ

- ユーザー: `User`
- 講義: `Lecture`
- 時間割登録: `Registration`
- タスク: `Task`
- 記事: `Article`

## エラー処理

- 例外は `src/lib/errors.ts` のアプリエラーに寄せる。
- UI ではユーザー向けメッセージを優先する。
