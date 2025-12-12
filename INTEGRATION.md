# FlowCore フロントエンド・バックエンド統合ガイド

このドキュメントでは、FlowCoreのフロントエンドとバックエンドの統合について説明します。

## 📋 実装概要

### 完了した実装

- ✅ **OpenAPI仕様書**: `openapi.yaml` の作成
- ✅ **モックデータ**: バックエンドのシードデータ (`002_seed_data.sql`)
- ✅ **API通信レイヤー**: TypeScript型定義とAPIクライアント
- ✅ **コンポーネント統合**: Database Editor、API Editor、Auth Editorのバックエンド接続

---

## 🚀 セットアップ手順

### 1. バックエンドのセットアップ

#### データベースの準備

```bash
# PostgreSQLが起動していることを確認
psql -U postgres

# データベースを作成
CREATE DATABASE flowcore;

# マイグレーションを実行
psql -U postgres -d flowcore -f backend/migrations/001_init_schema.sql
psql -U postgres -d flowcore -f backend/migrations/002_seed_data.sql
```

#### バックエンドサーバーの起動

```bash
cd backend

# 依存関係のインストール（初回のみ）
go mod download

# サーバーを起動
go run cmd/server/main.go
```

バックエンドは `http://localhost:8080` で起動します。

### 2. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local

# 開発サーバーを起動
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

---

## 📁 プロジェクト構造

### バックエンド (`/backend`)

```
backend/
├── cmd/server/main.go              # エントリーポイント
├── config/config.go                # 設定管理
├── internal/
│   ├── api/
│   │   ├── admin/                  # 管理API
│   │   │   ├── tables.go
│   │   │   ├── endpoints.go
│   │   │   └── auth.go
│   │   └── runtime/                # ランタイムAPI
│   │       └── handler.go
│   ├── models/                     # データモデル
│   │   ├── table.go
│   │   ├── endpoint.go
│   │   ├── flow.go
│   │   ├── column.go
│   │   └── auth.go
│   ├── database/db.go              # DB接続
│   ├── middleware/                 # ミドルウェア
│   └── utils/response.go
└── migrations/                     # マイグレーション
    ├── 001_init_schema.sql
    └── 002_seed_data.sql
```

### フロントエンド (`/frontend`)

```
frontend/
├── app/                            # Next.js App Router
│   ├── layout.tsx
│   └── page.tsx
├── components/                     # Reactコンポーネント
│   ├── node-canvas.tsx             # フローエディタ
│   ├── api-editor.tsx              # APIエンドポイント管理
│   ├── database-editor.tsx         # データベーステーブル管理
│   ├── auth-editor.tsx             # 認証設定UI
│   └── ui/                         # UIコンポーネント
├── lib/                            # ユーティリティ
│   ├── types.ts                    # TypeScript型定義
│   ├── api-client.ts               # APIクライアント
│   └── api/                        # API関数
│       ├── tables.ts
│       ├── endpoints.ts
│       ├── auth.ts
│       └── health.ts
└── .env.local                      # 環境変数
```

---

## 🔌 API統合の詳細

### APIクライアント (`/frontend/lib/api-client.ts`)

すべてのAPI呼び出しは `apiClient` を通じて行われます。

```typescript
import { apiClient } from "@/lib/api-client"

// 使用例
const result = await apiClient.get("/admin/tables")

if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

### API関数

各リソースごとにAPI関数が用意されています：

#### テーブル管理 (`/frontend/lib/api/tables.ts`)

```typescript
import { getTables, createTable, updateTable, deleteTable, importCSV } from "@/lib/api"

// テーブル一覧を取得
const tables = await getTables()

// テーブルを作成
const newTable = await createTable({
  name: "users",
  columns: [
    { name: "id", type: "uuid", required: true },
    { name: "email", type: "text", required: true },
  ],
})
```

#### エンドポイント管理 (`/frontend/lib/api/endpoints.ts`)

```typescript
import { getEndpoints, createEndpoint, updateEndpoint, deleteEndpoint, executeEndpoint } from "@/lib/api"

// エンドポイント一覧を取得
const endpoints = await getEndpoints()

// エンドポイントを作成
const newEndpoint = await createEndpoint({
  name: "Get Users",
  method: "GET",
  path: "/users",
  flow: { nodes: [...], connections: [...] },
})

// エンドポイントをテスト実行
const result = await executeEndpoint("/users", "GET")
```

#### 認証設定 (`/frontend/lib/api/auth.ts`)

```typescript
import { getAuthSettings, updateAuthSettings, getAuthFields } from "@/lib/api"

// 認証設定を取得
const authSettings = await getAuthSettings()

// 認証設定を更新
const updated = await updateAuthSettings({
  method: "email",
  config: {
    min_password_length: 8,
    require_special_char: true,
  },
})
```

---

## 🎨 コンポーネントの動作

### Database Editor

- **初期読み込み**: `useEffect` でバックエンドからテーブル一覧を取得
- **テーブル作成**: `createTable` APIを呼び出し
- **カラム追加**: `updateTable` APIでカラムを追加
- **テーブル削除**: `deleteTable` APIを呼び出し
- **CSVインポート**: `importCSV` APIを呼び出し

### API Editor

- **初期読み込み**: `useEffect` でエンドポイント一覧を取得
- **エンドポイント作成**: `createEndpoint` APIを呼び出し
- **エンドポイント更新**: パスやメソッド変更時に `updateEndpoint` を呼び出し
- **エンドポイント削除**: `deleteEndpoint` APIを呼び出し
- **テスト実行**: `executeEndpoint` APIで動的エンドポイントを実行

### Auth Editor

- **初期読み込み**: 認証設定とユーザーフィールドを取得
- **設定更新**: 保存ボタンクリック時に `updateAuthSettings` を呼び出し

---

## 🔧 環境変数

### フロントエンド (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### バックエンド (`.env`)

```env
# データベース設定
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=flowcore
DB_SSLMODE=disable

# サーバー設定
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
```

---

## 📊 モックデータ

バックエンドには以下のモックデータが用意されています：

### サンプルユーザー

- alice@example.com
- bob@example.com
- charlie@example.com

### サンプルアイテム

- ヒールポーション (rarity: 1)
- マナポーション (rarity: 1)
- 鉄の剣 (rarity: 2)
- 鋼の盾 (rarity: 2)
- エリクサー (rarity: 3)
- 伝説の剣 (rarity: 5)

### サンプルエンドポイント

1. **ユーザー一覧取得**: `GET /users/list`
2. **アイテムマスター一覧取得**: `GET /items/master`
3. **ユーザーアイテム取得**: `GET /users/{user_id}/items`

---

## 🧪 動作確認手順

### 1. ヘルスチェック

```bash
curl http://localhost:8080/health
# 期待結果: OK
```

### 2. テーブル一覧取得

```bash
curl http://localhost:8080/admin/tables
# 期待結果: JSONでテーブル一覧が返る
```

### 3. エンドポイント一覧取得

```bash
curl http://localhost:8080/admin/endpoints
# 期待結果: JSONでエンドポイント一覧が返る
```

### 4. フロントエンドでの動作確認

1. ブラウザで `http://localhost:3000` を開く
2. **Database** タブでテーブル一覧が表示されることを確認
3. **API** タブでエンドポイント一覧が表示されることを確認
4. **Auth** タブで認証設定が表示されることを確認

---

## ⚠️ 既知の制限事項

### バックエンド側

1. **Runtime API**: フローエンジンが未実装のため、動的エンドポイントの実行は動作しません
2. **カラム削除**: テーブル更新APIはカラム追加のみ対応（削除・修正は未実装）
3. **CSVインポート**: スケルトン実装のみ

### フロントエンド側

1. **NodeCanvas**: フロー定義の保存はローカルのみ（バックエンド連携は今後の課題）
2. **エラーハンドリング**: 簡易的なアラート表示のみ（改善の余地あり）

---

## 🔄 今後の拡張方針

1. **フローエンジンの実装**: Runtime APIで実際にフローを実行できるようにする
2. **リアルタイム更新**: WebSocketを使った複数ユーザー間の同期
3. **バリデーション強化**: フロントエンド・バックエンド両方でのバリデーション
4. **認証機能の実装**: JWT認証やOAuth2.0の実装
5. **テストの追加**: ユニットテスト、統合テストの追加

---

## 📚 参考リンク

- [OpenAPI仕様書](../openapi.yaml)
- [バックエンド仕様](../agent_docs/backend_spec.md)
- [フロントエンド仕様](../agent_docs/frontend_spec.md)
- [システム概要](../agent_docs/system_overview.md)

---

作成日: 2025-12-12
最終更新: 2025-12-12
