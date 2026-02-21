# App Structure

## 基本方針

- Next.js App Router を使用する。
- 画面は `src/app` に置く。
- 機能ロジックは `src/features` に寄せる。

## ディレクトリの役割

- `src/app/(static)`: ログインや規約などの静的ページ。
- `src/app/(webapp)`: ログイン後のアプリページ。
- `src/features/*/actions`: Server Action。
- `src/features/*/components`: UI コンポーネント。
- `src/lib`: 共通ライブラリ連携とユーティリティ。

## 実装ルール

- コンポーネントに過剰なロジックを置かない。
- 共通ロジックは `features/*/utils` へ移す。
- アクセス制御はサーバー側で判定する。
