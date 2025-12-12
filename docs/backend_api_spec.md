# FlowCore バックエンド API仕様書

## 概要

FlowCoreは、Xanoのようなノーコードバックエンド構築基盤です。このドキュメントでは、Goで実装されるバックエンドAPIの仕様を定義します。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│  (Database Editor / API Editor / Auth Editor / Flow Canvas) │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────┴─────────────────────────────────┐
│                      Go Backend API                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin API  │  │  Runtime API │  │  Flow Engine │      │
│  │ (MetaDB管理)  │  │ (動的API実行) │  │ (ノード実行)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      PostgreSQL                              │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │   MetaDB     │  │        UserDB (動的)              │    │
│  │ (メタデータ)  │  │ (ユーザー定義テーブル)             │    │
│  └──────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## ベースURL

- 開発環境: `http://localhost:8080`
- Admin API: `/admin`
- Runtime API: `/api` (ユーザー定義エンドポイント)

## 認証

現時点ではシンプルな認証を想定。将来的にJWT認証やOAuth対応を追加予定。

```
Authorization: Bearer <token>
```

---

## 1. Database Management API (データベース管理)

### 1.1 テーブル一覧取得

```http
GET /admin/tables
```

**レスポンス例:**
```json
{
  "tables": [
    {
      "id": "uuid-1",
      "name": "users",
      "columns": [
        {
          "id": "col-1",
          "name": "id",
          "type": "uuid",
          "required": true
        },
        {
          "id": "col-2",
          "name": "email",
          "type": "text",
          "required": true
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 1.2 テーブル作成

```http
POST /admin/tables
```

**リクエストボディ:**
```json
{
  "name": "users",
  "columns": [
    {
      "name": "id",
      "type": "uuid",
      "required": true
    },
    {
      "name": "email",
      "type": "text",
      "required": true
    }
  ]
}
```

**レスポンス例:**
```json
{
  "id": "uuid-1",
  "name": "users",
  "columns": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 1.3 テーブル更新

```http
PUT /admin/tables/:id
```

**リクエストボディ:**
```json
{
  "name": "users_updated",
  "columns": [...]
}
```

### 1.4 テーブル削除

```http
DELETE /admin/tables/:id
```

### 1.5 CSVインポート

```http
POST /admin/tables/:id/import
```

**リクエストボディ:**
```json
{
  "csv_data": "id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com"
}
```

---

## 2. API Endpoint Management API (エンドポイント管理)

### 2.1 エンドポイント一覧取得

```http
GET /admin/endpoints
```

**レスポンス例:**
```json
{
  "endpoints": [
    {
      "id": "endpoint-1",
      "name": "Get Users",
      "method": "GET",
      "path": "/api/users",
      "flow": {
        "nodes": [...],
        "connections": [...]
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2.2 エンドポイント作成

```http
POST /admin/endpoints
```

**リクエストボディ:**
```json
{
  "name": "Get Users",
  "method": "GET",
  "path": "/api/users",
  "flow": {
    "nodes": [
      {
        "id": "node-1",
        "type": "start",
        "label": "リクエスト",
        "x": 50,
        "y": 150,
        "config": {
          "method": "GET",
          "params": ["userId"]
        },
        "pins": [
          {
            "id": "pin-1",
            "node_id": "node-1",
            "type": "output",
            "data_type": "string",
            "label": "userId"
          }
        ]
      },
      {
        "id": "node-2",
        "type": "database",
        "label": "ユーザー取得",
        "x": 400,
        "y": 150,
        "config": {
          "database": "main",
          "table": "users",
          "operation": "select",
          "columns": ["id", "name", "email"]
        },
        "pins": [...]
      }
    ],
    "connections": [
      {
        "id": "conn-1",
        "from": {
          "node_id": "node-1",
          "pin_id": "pin-1"
        },
        "to": {
          "node_id": "node-2",
          "pin_id": "pin-2"
        }
      }
    ]
  }
}
```

### 2.3 エンドポイント更新

```http
PUT /admin/endpoints/:id
```

### 2.4 エンドポイント削除

```http
DELETE /admin/endpoints/:id
```

### 2.5 エンドポイント詳細取得

```http
GET /admin/endpoints/:id
```

---

## 3. Auth Management API (認証管理)

### 3.1 認証設定取得

```http
GET /admin/auth/settings
```

**レスポンス例:**
```json
{
  "method": "email",
  "email_config": {
    "min_password_length": 8,
    "require_special_char": true,
    "require_number": true,
    "email_verification": true
  },
  "oauth_providers": []
}
```

### 3.2 認証設定更新

```http
PUT /admin/auth/settings
```

**リクエストボディ:**
```json
{
  "method": "email",
  "email_config": {
    "min_password_length": 10,
    "require_special_char": true,
    "require_number": true,
    "email_verification": true
  }
}
```

### 3.3 ユーザーフィールド取得

```http
GET /admin/auth/fields
```

**レスポンス例:**
```json
{
  "fields": [
    {
      "name": "email",
      "type": "text",
      "required": true
    },
    {
      "name": "username",
      "type": "text",
      "required": false
    }
  ]
}
```

### 3.4 ユーザーフィールド追加

```http
POST /admin/auth/fields
```

---

## 4. Runtime API (動的エンドポイント実行)

ユーザーが定義したエンドポイントは、動的に実行されます。

### 例: GET /api/users

```http
GET /api/users?userId=123
```

**処理フロー:**
1. `/api/users`パスに対応するエンドポイント定義をMetaDBから取得
2. フロー定義（ノード＋コネクション）を解析
3. フローエンジンでノードを順次実行
   - Startノード: リクエストパラメータ取得
   - Databaseノード: データベースクエリ実行
   - Processノード: JavaScript実行
   - Responseノード: レスポンス生成
4. 結果をクライアントに返却

**レスポンス例:**
```json
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

## 5. データモデル (MetaDB)

### 5.1 tables テーブル

```sql
CREATE TABLE meta_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5.2 columns テーブル

```sql
CREATE TABLE meta_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES meta_tables(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- text, integer, uuid, timestamp, boolean, json
    required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5.3 endpoints テーブル

```sql
CREATE TABLE meta_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE
    path VARCHAR(500) NOT NULL UNIQUE,
    flow_definition JSONB NOT NULL, -- ノード＋コネクションのJSON
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5.4 auth_settings テーブル

```sql
CREATE TABLE meta_auth_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method VARCHAR(50) NOT NULL, -- email, oauth
    config JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 6. ノードタイプ仕様

### 6.1 Start ノード

リクエストの入り口。HTTPメソッドとパラメータを定義。

**Config:**
```json
{
  "method": "GET",
  "params": ["userId", "status"]
}
```

**Output Pins:**
- パラメータごとに1つのoutputピン

### 6.2 Database ノード

データベースクエリを実行。

**Config:**
```json
{
  "database": "main",
  "table": "users",
  "operation": "select",
  "columns": ["id", "name", "email"]
}
```

**Input Pins:**
- WHERE条件用のinputピン

**Output Pins:**
- カラムごとに1つのoutputピン

### 6.3 Process ノード

JavaScriptコードを実行。

**Config:**
```json
{
  "processType": "script",
  "script": "return Math.floor(Math.random() * 100) + 1;"
}
```

**Input Pins:**
- 入力データ用のinputピン

**Output Pins:**
- 実行結果用のoutputピン

### 6.4 Filter ノード

データ変換（map/filter/reduce/sort）を実行。

**Config:**
```json
{
  "transformType": "map",
  "script": "data.map(item => ({ ...item, fullName: item.firstName + ' ' + item.lastName }))"
}
```

### 6.5 Response ノード

レスポンスを生成。

**Config:**
```json
{
  "statusCode": "200",
  "selectedFields": ["pin-1", "pin-2"],
  "format": "json"
}
```

**Input Pins:**
- レスポンスに含めるデータ用のinputピン

---

## 7. エラーレスポンス

すべてのエラーレスポンスは以下の形式で返却されます。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Email is required"
    }
  }
}
```

**エラーコード一覧:**
- `VALIDATION_ERROR`: バリデーションエラー
- `NOT_FOUND`: リソースが見つからない
- `INTERNAL_ERROR`: サーバー内部エラー
- `UNAUTHORIZED`: 認証エラー
- `FORBIDDEN`: 権限エラー

---

## 8. 実装予定機能

- [ ] WebSocket対応（リアルタイム更新）
- [ ] Webhook機能
- [ ] スケジュールタスク
- [ ] バージョン管理
- [ ] ロールベースアクセス制御（RBAC）
- [ ] API使用量制限（Rate Limiting）
- [ ] ログ・監視機能

---

このドキュメントは開発の進行に伴い更新されます。
