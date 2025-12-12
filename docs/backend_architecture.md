# FlowCore バックエンドアーキテクチャ

## ディレクトリ構造

```
backend/
├── cmd/
│   └── server/
│       └── main.go                 # アプリケーションエントリーポイント
├── internal/
│   ├── api/
│   │   ├── admin/                  # Admin API ハンドラー
│   │   │   ├── tables.go           # テーブル管理API
│   │   │   ├── endpoints.go        # エンドポイント管理API
│   │   │   └── auth.go             # 認証設定API
│   │   └── runtime/                # Runtime API ハンドラー
│   │       └── handler.go          # 動的エンドポイント実行
│   ├── models/                     # データモデル
│   │   ├── table.go
│   │   ├── column.go
│   │   ├── endpoint.go
│   │   ├── flow.go
│   │   └── auth.go
│   ├── database/                   # データベース接続・操作
│   │   ├── db.go                   # DB接続管理
│   │   ├── metadb.go               # MetaDB操作
│   │   └── userdb.go               # UserDB動的操作
│   ├── flow/                       # フローエンジン
│   │   ├── engine.go               # フロー実行エンジン
│   │   ├── executor.go             # ノード実行
│   │   └── nodes/                  # ノード実装
│   │       ├── start.go
│   │       ├── database.go
│   │       ├── process.go
│   │       ├── filter.go
│   │       └── response.go
│   ├── middleware/                 # ミドルウェア
│   │   ├── cors.go
│   │   ├── auth.go
│   │   └── logger.go
│   └── utils/                      # ユーティリティ
│       ├── response.go             # レスポンスヘルパー
│       └── validator.go            # バリデーション
├── migrations/                     # データベースマイグレーション
│   └── 001_init_schema.sql
├── config/                         # 設定ファイル
│   └── config.go
├── go.mod
├── go.sum
└── README.md
```

## レイヤーアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│              (API Handlers / Middleware)                │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Admin API      │         │   Runtime API    │    │
│  └──────────────────┘         └──────────────────┘    │
└──────────────────────┬──────────────────┬──────────────┘
                       │                  │
┌──────────────────────┴──────────────────┴──────────────┐
│                    Business Logic Layer                │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Flow Engine    │         │  Table Manager   │    │
│  └──────────────────┘         └──────────────────┘    │
└──────────────────────┬──────────────────┬──────────────┘
                       │                  │
┌──────────────────────┴──────────────────┴──────────────┐
│                   Data Access Layer                    │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │     MetaDB       │         │     UserDB       │    │
│  └──────────────────┘         └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 主要コンポーネント

### 1. API Layer

#### Admin API
- テーブル・カラムの管理
- エンドポイント・フロー定義の管理
- 認証設定の管理

#### Runtime API
- 動的エンドポイントの実行
- フローエンジンの呼び出し

### 2. Flow Engine

フローエンジンは以下の責務を持つ：

1. **Flow Parsing**: フロー定義（JSON）を解析
2. **Node Execution**: ノードを依存関係順に実行
3. **Data Flow**: ピン間のデータ受け渡し
4. **Error Handling**: 実行エラーのハンドリング

#### 実行フロー

```
1. エンドポイント定義取得
   ↓
2. フロー定義解析
   ↓
3. 実行順序決定（トポロジカルソート）
   ↓
4. ノード実行ループ
   ├─ Start Node: リクエストパラメータ抽出
   ├─ Database Node: SQL実行
   ├─ Process Node: JavaScript実行
   ├─ Filter Node: データ変換
   └─ Response Node: レスポンス生成
   ↓
5. レスポンス返却
```

### 3. Database Layer

#### MetaDB
- テーブル定義の管理
- エンドポイント定義の管理
- 認証設定の管理

#### UserDB
- ユーザー定義テーブルへの動的アクセス
- 動的SQLの生成・実行

### 4. Node Types

各ノードタイプは以下のインターフェースを実装：

```go
type Node interface {
    Execute(ctx context.Context, inputs map[string]interface{}) (map[string]interface{}, error)
}
```

## 技術スタック

### 必須ライブラリ

- **Web Framework**: [Chi Router](https://github.com/go-chi/chi)
- **Database**: PostgreSQL
- **Database Driver**: [pgx](https://github.com/jackc/pgx)
- **JSON**: encoding/json（標準ライブラリ）
- **Validation**: [go-playground/validator](https://github.com/go-playground/validator)
- **JavaScript実行**: [goja](https://github.com/dop251/goja) (Go製JavaScriptエンジン)
- **環境変数**: [godotenv](https://github.com/joho/godotenv)

### オプショナル

- **Migration**: [golang-migrate](https://github.com/golang-migrate/migrate)
- **Logging**: [zap](https://github.com/uber-go/zap)
- **Testing**: [testify](https://github.com/stretchr/testify)

## データフロー

### Admin API - テーブル作成フロー

```
Client Request
    ↓
POST /admin/tables
    ↓
TableHandler.Create()
    ↓
Validate Request
    ↓
MetaDB: INSERT INTO meta_tables
    ↓
UserDB: CREATE TABLE <table_name>
    ↓
Response
```

### Runtime API - エンドポイント実行フロー

```
Client Request
    ↓
GET /api/users?userId=123
    ↓
RuntimeHandler.Execute()
    ↓
MetaDB: SELECT endpoint WHERE path='/api/users'
    ↓
FlowEngine.Execute(flow_definition, params)
    ├─ StartNode: Extract userId=123
    ├─ DatabaseNode: SELECT * FROM users WHERE id=123
    ├─ ProcessNode: Execute JavaScript
    └─ ResponseNode: Build JSON response
    ↓
Response
```

## セキュリティ考慮事項

### SQL Injection対策
- プリペアドステートメントの使用
- 動的SQL生成時のホワイトリストチェック

### XSS対策
- レスポンスのエスケープ処理

### JavaScript実行の制限
- タイムアウト設定（最大実行時間）
- メモリ制限
- ファイルシステムアクセス禁止

## パフォーマンス最適化

### キャッシング
- エンドポイント定義のキャッシング
- テーブルスキーマのキャッシング

### 接続プーリング
- データベース接続プールの活用

### 並列処理
- 独立したノードの並列実行（将来実装）

## 開発フェーズ

### Phase 1: MVP実装
- [x] 仕様書作成
- [ ] プロジェクト構造構築
- [ ] Admin API実装（テーブル管理）
- [ ] Admin API実装（エンドポイント管理）
- [ ] Flow Engine実装（基本ノード）
- [ ] Runtime API実装

### Phase 2: 拡張機能
- [ ] 認証機能実装
- [ ] JavaScript実行環境の強化
- [ ] エラーハンドリング改善
- [ ] テスト追加

### Phase 3: 本番対応
- [ ] ロギング・モニタリング
- [ ] パフォーマンス最適化
- [ ] セキュリティ監査
- [ ] ドキュメント整備

---

このアーキテクチャは開発の進行に伴い進化します。
