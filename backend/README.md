# FlowCore Backend

FlowCoreのGoバックエンドAPI実装です。

## 概要

FlowCoreは、Xanoのようなノーコードバックエンド構築基盤です。このバックエンドは以下の機能を提供します：

- **Database Management**: テーブル・カラムの動的管理
- **API Endpoint Management**: APIエンドポイントとフロー定義の管理
- **Auth Management**: 認証設定の管理
- **Runtime Execution**: ノードベースのフロー実行エンジン

## 技術スタック

- **言語**: Go 1.21+
- **Webフレームワーク**: Chi Router
- **データベース**: PostgreSQL 14+
- **ドライバ**: lib/pq

## ディレクトリ構造

```
backend/
├── cmd/server/          # アプリケーションエントリーポイント
├── internal/
│   ├── api/
│   │   ├── admin/       # Admin API ハンドラー
│   │   └── runtime/     # Runtime API ハンドラー
│   ├── models/          # データモデル
│   ├── database/        # データベース接続
│   ├── flow/            # フローエンジン
│   ├── middleware/      # ミドルウェア
│   └── utils/           # ユーティリティ
├── migrations/          # データベースマイグレーション
├── config/              # 設定
└── README.md
```

## セットアップ

### 1. 依存関係のインストール

```bash
cd backend
go mod download
```

### 2. データベースのセットアップ

PostgreSQLをインストールし、データベースを作成します：

```bash
createdb flowcore
```

マイグレーションを実行します：

```bash
psql -d flowcore -f migrations/001_init_schema.sql
```

### 3. 環境変数の設定

`.env`ファイルを作成します：

```bash
cp .env.example .env
```

`.env`を編集して設定を調整します。

### 4. サーバーの起動

```bash
go run cmd/server/main.go
```

デフォルトでは `http://localhost:8080` でサーバーが起動します。

## API エンドポイント

### ヘルスチェック

```bash
GET /health
```

### Admin API

#### テーブル管理

```bash
# テーブル一覧取得
GET /admin/tables

# テーブル作成
POST /admin/tables

# テーブル更新
PUT /admin/tables/:id

# テーブル削除
DELETE /admin/tables/:id

# CSVインポート
POST /admin/tables/:id/import
```

#### エンドポイント管理

```bash
# エンドポイント一覧取得
GET /admin/endpoints

# エンドポイント詳細取得
GET /admin/endpoints/:id

# エンドポイント作成
POST /admin/endpoints

# エンドポイント更新
PUT /admin/endpoints/:id

# エンドポイント削除
DELETE /admin/endpoints/:id
```

#### 認証管理

```bash
# 認証設定取得
GET /admin/auth/settings

# 認証設定更新
PUT /admin/auth/settings

# ユーザーフィールド取得
GET /admin/auth/fields
```

### Runtime API

```bash
# 動的エンドポイント実行
GET/POST/PUT/DELETE /api/*
```

## 開発

### テストの実行

```bash
go test ./...
```

### ビルド

```bash
go build -o bin/server cmd/server/main.go
```

### 本番環境へのデプロイ

```bash
# バイナリをビルド
CGO_ENABLED=0 GOOS=linux go build -o bin/server cmd/server/main.go

# Dockerイメージをビルド（将来実装予定）
docker build -t flowcore-backend .
```

## 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| SERVER_PORT | 8080 | サーバーポート |
| SERVER_HOST | 0.0.0.0 | サーバーホスト |
| DB_HOST | localhost | データベースホスト |
| DB_PORT | 5432 | データベースポート |
| DB_USER | postgres | データベースユーザー |
| DB_PASSWORD | postgres | データベースパスワード |
| DB_NAME | flowcore | データベース名 |
| DB_SSLMODE | disable | SSL接続モード |

## トラブルシューティング

### データベース接続エラー

```
Failed to connect to database: ...
```

- PostgreSQLが起動しているか確認してください
- `.env`ファイルのDB接続設定を確認してください

### ポートが既に使用されている

```
Failed to start server: address already in use
```

- `SERVER_PORT`を変更してください

## ライセンス

MIT License

## 開発者向けドキュメント

詳細な仕様については、以下のドキュメントを参照してください：

- [API仕様書](../docs/backend_api_spec.md)
- [アーキテクチャ設計](../docs/backend_architecture.md)
