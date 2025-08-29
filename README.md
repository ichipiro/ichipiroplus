# Ichipiroplus

大学の時間割管理アプリケーション

## セットアップ

### 必要な環境
- Node.js 18以上
- Docker & Docker Compose
- npm または pnpm

### 初期設定

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
```bash
cp .env.example .env.local
# .env.localを編集して必要な値を設定
```

3. データベースとMinIOの起動
```bash
npm run db:up
# または docker-compose up -d
```

MinIO管理コンソール: http://localhost:9001
- ユーザー名: minioadmin
- パスワード: minioadmin

4. データベースのマイグレーション
```bash
npm run db:migrate
```

5. 開発サーバーの起動
```bash
npm run dev
```

## 開発コマンド

### データベース関連
- `npm run db:up` - PostgreSQLコンテナを起動
- `npm run db:down` - PostgreSQLコンテナを停止
- `npm run db:migrate` - マイグレーションを実行
- `npm run db:generate` - Prisma Clientを生成
- `npm run db:studio` - Prisma Studioを起動（DBをGUIで確認）
- `npm run db:seed` - シードデータを投入

### 開発
- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルド
- `npm run lint` - リンティング
- `npm run format` - コードフォーマット

## アーキテクチャ

- **フロントエンド**: Next.js 14 (App Router)
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: NextAuth.js (Microsoft Entra ID)
- **UI**: Yamada UI
- **ホスティング**: Vercel (本番環境)

## プロジェクト構造

```
ichipiroplus-front/
├── app/              # Next.js App Router
│   ├── api/         # API Routes
│   └── (routes)/    # ページコンポーネント
├── prisma/          # Prismaスキーマとマイグレーション
├── src/             # ソースコード
│   ├── components/  # UIコンポーネント
│   └── lib/        # ユーティリティ
└── docker-compose.yml # ローカル開発用DB
```