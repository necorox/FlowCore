# バックエンド仕様（Go API）

---

## 1. サービス構成
バックエンドは以下のマイクロサービス的役割を持つが、最初は単一バイナリで提供する：

### Auth API
- 内部IdP（メール＋パスワード）
- JWT発行（RS256）
- リフレッシュトークン対応

### Admin API
- プロジェクト作成
- DB/Redis接続登録
- API定義 CRUD
- フロー定義 CRUD
- デプロイ管理

### Runtime API（API Gateway）
- HTTPリクエストを受け取る
- メタデータから対応ルートを特定
- 認証
- Flow Engine呼び出し
- レスポンス返却

### Flow Engine
- ノードベース実行
- 非同期実行サポート（将来）
- ステップ数制限 / タイムアウト

---

## 2. データ保存先

### MetaDB（PostgreSQL）
- users / user_identities
- projects
- connections（AppDB / Redis）
- apis
- flows
- flow_versions
- deployments

### MetaCache（Redis）
- 定義キャッシュ
- Pub/Sub（API/Flow更新イベント）
- セッション

---

## 3. 認証仕様

### JWT構成  
payload 例：

```json
{
  "sub": "user_123",
  "tenant_id": "t001",
  "roles": ["admin"],
  "exp": 1712345678,
  "iat": 1712341234
}
````

署名：RS256
鍵：`MASTER_KEY` で管理

---

## 4. API定義読み込み

1. Runtime API が HTTPリクエストを受ける
2. MetaCache から定義を検索
3. 見つからなければ MetaDB を参照
4. Flow Version を Flow Engine に渡す
5. 実行しレスポンス返却

---

## 5. フローエンジン仕様（簡易）

* 各ノードは Go のインタフェースを実装
* 実行コンテキストに

  * ユーザー情報
  * 接続情報
  * HTTPパラメータ
  * ローカル変数
    を保持