# Database

## 使用技術

- PostgreSQL
- Prisma ORM

## 主要モデル

- `User`: ユーザープロフィールと権限。
- `Lecture`: 講義情報。
- `LectureTerm`: 講義とタームの多対多。
- `Schedule`: 曜日・時限マスタ。
- `Registration`: ユーザーの講義登録。
- `Task`: 個人タスク。
- `Article`: 記事。

## 参照先

- スキーマ定義: `prisma/schema.prisma`
- ER図: `docs/architecture/er-diagram.md`
