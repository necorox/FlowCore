# フロントエンド仕様（React SPA）

---

## 1. 技術構成
- React 18+
- TypeScript
- Vite または Next.js（SPAモード）
- Zustand or Redux（状態管理）
- React Query（APIフェッチ）
- shadcn/ui or MUI（コンポーネント）

---

## 2. メイン画面

### 1. ログイン画面
- メール / パスワード入力
- 失敗時メッセージ表示
- ログイン後、JWTセッションで Admin API を使用

### 2. ダッシュボード
- プロジェクト一覧
- 接続済みDB/Cacheの確認

### 3. APIエディタ
- HTTPメソッド・パス編集
- 認証設定
- フロー選択（バージョン管理）

### 4. フローエディタ（重要）
- ノードパレット（DB操作・条件分岐・演算・レスポンスなど）
- キャンバス上でノード接続
- プレビュー（JSON表示）

### 5. 接続設定画面
- AppDB（PostgreSQL/MySQL）
- Redis/Valkey
- 接続テスト機能

### 6. デプロイ管理
- フローバージョン一覧
- 本番適用ボタン
- ロールバック

---

## 3. API通信

### 認証
- CookieまたはlocalStorageで JWT 管理

### エンドポイント
- `/auth/*`
- `/admin/*`
- `/runtime/*`（デバッグ用）

---

## 4. UXにおける制約
- リアルタイム更新は WebSocket または Polling で対応
- 保存前のフローはローカルにドラフト状態保持