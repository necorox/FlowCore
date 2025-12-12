# アーキテクチャ仕様

---

## 1. 全体構成図（Master + Worker 可能な構造）

````

[React AdminUI] → [Auth API / Admin API] → (MetaDB / MetaCache)
↑
|
[Runtime API (Worker)] → [Flow Engine] → [AppDB / Redis]

```

---

## 2. コンポーネント詳細

### Admin（管理側）
- 認証
- 設定編集
- APIとフローのCRUD
- デプロイメント管理

### Runtime（実行側）
- API Gateway
- 認証チェック
- フロー実行

---

## 3. データフロー

**API実行時：**

1. Runtimeがリクエストを受ける  
2. JWTを検証  
3. MetaCacheからルート定義をロード  
4. Flow Engine実行  
5. 外部DB/キャッシュへアクセス  
6. レスポンス返却

---

## 4. スケーラビリティ方針
- Runtimeは水平スケール可能（stateless）
- MetaDBはPostgreSQLクラスタで冗長化可能
- MetaCacheはRedis Clusterでスケール可能

---

## 5. セキュリティ
- 全通信HTTPS
- 接続情報はアプリ側で暗号化して保存
- JWTはRS256署名
- RBACによる権限制御
- フロー実行ステップ数制限・タイムアウト

---

## 6. 今後の拡張
- OIDCログイン
- Workerの自動登録
- ノードプラグイン（ユーザー拡張）
- スケジューラ / Webhook