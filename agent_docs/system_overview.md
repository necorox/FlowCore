# システム概要（System Overview）

本システムは、Xano のようなノーコードバックエンド構築基盤であり、  
管理UI（React）上で API・DB操作・キャッシュ処理・フローロジックを定義し、  
バックエンド（Go Runtime）がそれを実行する。

---

## 1. システム目的
- コーディング不要で API を作成できるバックエンド基盤を提供する。
- 複数の外部DB・キャッシュサーバーを登録し、それらをフローで扱える。
- エンドポイントごとにフローを紐付け、即時に REST API を生成する。

---

## 2. コアコンポーネント

1. **管理UI（React）**
   - API/フローの可視化・編集
   - DB/Redis 接続の登録とテスト
   - エンドポイントの追加・デプロイ管理

2. **バックエンド（Go）**
   - Auth API（内部IdP）
   - Admin API（設定操作）
   - Runtime API（実際のAPI実行入口）
   - Flow Engine（フローロジック実行）

3. **MetaDB（PostgreSQL）**
   - 設定情報・フロー定義・API定義を保存する中心DB

4. **MetaCache（Redis）**
   - 定義キャッシュ
   - セッション管理
   - 更新イベント通知（Pub/Sub）

---

## 3. 基本機能

### API定義
- HTTP Method（GET/POST/etc）
- Path
- 認証方式（internal JWT）
- 紐付くフロー（Flow Version）

### フロー定義
- ノード（DB操作・条件分岐・計算・レスポンス等）
- ノード間接続
- 実行時制限（ステップ数・タイムアウト）

### 認証
- 内部IdP（メール＋パスワード）
- JWTによるアクセス制御
- 外部IdP（OIDC）は将来拡張可能な構造

---

## 4. 今後の拡張予定
- SSO（OIDC）
- Master/Worker複数ノード構成
- Webhook対応
- スケジューラ（Cronフロー）
- バックアップ／インポート／エクスポート

