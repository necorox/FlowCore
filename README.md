# FlowCore 開発環境起動ガイド

このプロジェクトの動作環境（インフラ、バックエンド、フロントエンド）を起動・セットアップするための手順書です。
以下の手順に従って環境を構築してください。

## 📋 前提条件

- **Docker / Docker Compose**: インフラ起動に必要
- **Go 1.22+**: バックエンド実行に必要
- **Node.js 20+**: フロントエンド実行に必要

---

## 🚀 起動手順

### 1. インフラストラクチャ (Postgres, Redis)

データベースとRedisコンテナを起動します。

1. **コンテナの起動**
   ```bash
   # プロジェクトルートで実行
   bash infra/infra_start.sh
   ```

2. **データベースの初期化（初回のみ）**
   コンテナ起動後、データベースの作成とスキーマ・データの投入を行います。

   ```bash
   # 1. データベースの作成
   docker exec -i infra-db-1 psql -U postgres -c "CREATE DATABASE flowcore;"

   # 2. スキーマの適用
   cat backend/migrations/001_init_schema.sql | docker exec -i infra-db-1 psql -U postgres -d flowcore

   # 3. シードデータの投入
   cat backend/migrations/002_seed_data.sql | docker exec -i infra-db-1 psql -U postgres -d flowcore
   ```
   > **Note**: `002_seed_data.sql` のUUIDフォーマットエラーがある場合、修正が必要です（本環境では修正済み）。

### 2. バックエンド (Go)

バックエンドAPIサーバーを起動します。
コンテナ環境との接続性を確保するため、DBホストのIPアドレスを動的に取得して起動することをお勧めします。

```bash
cd backend

# 依存関係のインストール
go mod download

# サーバーの起動
# (DockerコンテナのIPアドレスを取得して環境変数に設定しつつ起動します)
DB_HOST=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' infra-db-1) \
DB_PASSWORD=0 \
go run cmd/server/main.go
```

**設定のポイント:**
- **DB_HOST**: DevContainer環境等では `localhost` でDBコンテナに接続できない場合があるため、コンテナの直接IPを指定します。
- **DB_PASSWORD**: `infra/compose.data.postgres.yaml` の設定にあわせ、パスワードは `0` を指定します。

### 3. フロントエンド (Next.js)

フロントエンド開発サーバーを起動します。

```bash
cd frontend

# 依存関係のインストール（初回のみ）
npm install

# 環境変数の準備（初回のみ）
cp .env.local.example .env.local
# 必要に応じて .env.local 内の NEXT_PUBLIC_API_URL を確認してください

# 開発サーバー起動
npm run dev
```

---

## ✅ 動作確認

各サービスが正しく起動しているか確認します。

- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
  - 画面が表示され、"Database", "API" タブ等でデータが表示されればOKです。
- **Backend Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
  - `OK` が返ってくれば正常です。
- **pgAdmin (DB管理画面)**: [http://localhost:8000](http://localhost:8000)
  - Email: `admin@example.com`
  - Password: `admin`

---

## ⚠️ トラブルシューティング

**Q. バックエンドで "dial tcp [::1]:5432: connect: connection refused" エラーが出る**
A. DBコンテナへの接続に失敗しています。`DB_HOST` 環境変数が正しくない可能性があります。上記の起動コマンド（`docker inspect` を使用する方法）を試してください。

**Q. データベース接続時に "password authentication failed" エラーが出る**
A. `DB_PASSWORD` が間違っています。`docker-compose` の設定に合わせて `DB_PASSWORD=0` を指定してください。
