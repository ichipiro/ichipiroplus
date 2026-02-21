# Auth And Permissions

## 認証

- 認証は NextAuth を使用する。
- 認証 API は `src/app/api/auth/[...nextauth]/route.ts`。

## 権限の基本

- 管理画面は管理者のみ。
- 講義編集は権限保持者のみ。
- 公開設定変更はオーナーのみ。
- 時間割コピーは公開設定に従う。

## 実装方針

- 権限チェックはサーバー側で行う。
- クライアント側の disabled は補助と考える。
