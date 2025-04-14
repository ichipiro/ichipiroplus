# Ichipiroplus frontend

## 開発環境のセットアップ

### 必要条件

- nvm
- npm 
- ichipiroplus-back(バックエンド)

### インストール

リポジトリをクローンした後、依存関係をインストールしてください。

```bash

# リポジトリのクローン
git clone git@github.com:ichipiro/ichipiroplus-front.git
cd ichipiroplus-front

# パッケージのインストール
npm install
```

### 環境変数の設定

`.env` ファイルをプロジェクトのルートに作成します。必要な環境変数は[IEのNotion内いちぴろぷらすページ](https://www.notion.so/env-1d5e013eb8eb80128174efb8d2c09665?pvs=4)に記載されています。

### 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリケーションが表示されます。

## コードスタイルとリンター

このプロジェクトでは以下のツールを使用してコードの品質を維持しています：

- **Biome** - リンターとフォーマッター
- **Lefthook** - コミット、プッシュ前にBiomeのコマンドを自動で実行します。

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

- **Next.js** - Reactフレームワーク
- **TypeScript** - 型安全な開発
- **Yamada UI** - UIコンポーネントライブラリ
- **SWR** - データフェッチング
- **NextAuth.js** - 認証
- **Tiptap** - リッチテキストエディタ

## ビルドと本番環境

```bash
# 本番用ビルドの作成
npm run build

# ビルドの確認
npm run start
```

## トラブルシューティング

- **APIエラーが発生する場合**:
  - バックエンドサーバーが起動しているか確認してください
  - APIエンドポイントが正しく設定されているか確認してください
  - ネットワーク接続を確認してください

- **認証エラーが発生する場合**:
  - `.env`ファイルに認証情報が正しく設定されているか確認してください
  - セッションクッキーをクリアしてみてください