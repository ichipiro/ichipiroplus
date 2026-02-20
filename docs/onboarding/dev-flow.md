# Development Flow

## Github Issues / Project 運用

- 課題を見つけたら Issue を作成する。
- タイトルと本文は自由。分類できるならラベルを付ける。
- Issue 作成時に GitHub Project へ自動登録される。
- 初期ステータスは `Backlog`。
- 着手時に担当者を設定し、`In progress` に変更する。
- PR を作成したら `In review` に変更する。
- レビュー完了後にマージし、`Done` に変更する。

## ブランチ運用

### 基本方針

- シンプルな運用を優先する。
- 機能追加・不具合修正は `feature` ブランチで行う。
- 変更は必ず Pull Request 経由で取り込む。
- 永続ブランチは常にデプロイ可能な状態を保つ。

### ブランチ戦略（現プロジェクト）

- `main`: 本番用ブランチ。
- `develop`: 開発の基準ブランチ。
- `feature/*`: 作業用の短命ブランチ。
- `hotfix/*`: 本番障害の緊急修正用。
- `topic/*`: 1つの feature を複数人で分担するときだけ使う。

### 派生ルール

- 通常作業は `develop` から `feature/*` を切る。
- 緊急修正は `main` から `hotfix/*` を切る。
- `topic/*` は `feature/*` から切る。
- 作業完了後に feature/topic/hotfix は削除する。

### 命名規則

- `feature/#<issue>` を基本形にする。
- 必要なら末尾に短い説明を足す。
- 例: `feature/#123`。
- 例: `feature/#123-lecture-filter`。
- 例: `hotfix/#456-login-error`。

### マージ方針

- `feature/*` -> `develop`: PR でレビュー後にマージする。
- `hotfix/*` -> `main`: PR でレビュー後にマージする。
- `hotfix/*` マージ後は `develop` にも反映する。
- 直 push はしない。

### タグ運用（リリース）

- リリースタグは `main` に付与する。
- 一度公開したタグは原則削除しない。

## コミットメッセージ

- 原則自由。
- ただし短く、変更内容が分かる文にする。
- 例: `feat: add timetable copy action`。
- 例: `fix: prevent hydration mismatch on profile page`。

## PR ルール

- PR には関連 Issue をリンクする。
- 仕様変更時は `docs/` も更新する。

## 参考

- Future Enterprise Arch Guidelines - Gitブランチフロー規約
- https://future-architect.github.io/arch-guidelines/documents/forGitBranch/git_branch_standards.html
