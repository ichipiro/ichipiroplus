# Ichipiroplus

## 開発環境のセットアップ

### 必要条件

- nvm
- npm

### インストール

リポジトリをクローンした後、依存関係をインストールしてください。

```bash

# リポジトリのクローン
git clone git@github.com:53-gm/ichipiroplus.git
cd ichipiroplus

# パッケージのインストール
npm install
```

### 環境変数の設定

`.env` ファイルをプロジェクトのルートに作成します。必要な環境変数は[IE の Notion 内いちぴろぷらすページ](https://www.notion.so/env-1d5e013eb8eb80128174efb8d2c09665?pvs=4)に記載されています。

### 開発サーバーの起動

初回起動時

```bash

# DB, Storage起動
docker-compose up -d

# マイグレート
npm run db:migrate

# 初期値の挿入
npm run db:seed

# 開発サーバーを起動
npm run dev

# DB, Storage停止
docker-compose down
```

二回目以降

```bash

# DB, Storage起動
docker-compose up -d

# 開発サーバーを起動
npm run dev

# DB, Storage停止
docker-compose down
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリケーションが表示されます。

## コードスタイルとリンター

このプロジェクトでは以下のツールを使用してコードの品質を維持しています：

- **Biome** - リンターとフォーマッター
- **Lefthook** - コミット、プッシュ前に Biome のコマンドを自動で実行します。

```bash
npm run lint
npm run format
npm run check # lint + format
```

## プロジェクト構成

```bash
src
├── app              # Next.js App Routeのルート
│   ├── (static)     # 静的情報ページ
│   ├── (webapp)     # ダッシュボードなどアプリのページ
│   └── api          # NextAuthの設定
├── components       # 共通のコンポーネント
├── features         # 機能ごとのコンポーネント・ロジック
│   ├── article      # 記事機能
│   ├── editor       # エディタ機能 (Tiptap)
│   ├── task         # タスク機能
│   ├── timetable    # 時間割機能
│   ├── user         # ユーザー関連機能
│   └── webpush      # プッシュ通知機能
├── hooks            # 共通のカスタムフック
├── lib              # ユーティリティ関数
├── theme            # YamadaUIのテーマ
├── types            # 型定義
└── worker           # サービスワーカー
```

## 主要な技術スタック

- **Next.js** - React フレームワーク
- **TypeScript** - 型安全な開発
- **Yamada UI** - UI コンポーネントライブラリ
- **NextAuth.js** - 認証
- **Tiptap** - リッチテキストエディタ

## ビルドと本番環境

```bash
# 本番用ビルドの作成
npm run build

# ビルドの確認
npm run start
```

## 開発コマンド

データベース関連

- npm run db:migrate - マイグレーションを実行
- npm run db:generate - Prisma Client を生成
- npm run db:studio - Prisma Studio を起動（DB を GUI で確認）
- npm run db:seed - シードデータを投入

開発

- npm run dev - 開発サーバーを起動
- npm run build - プロダクションビルド
- npm run lint - リンティング
- npm run format - コードフォーマット
