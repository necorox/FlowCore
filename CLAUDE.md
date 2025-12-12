
# CLAUDE.md

このプロジェクトは、Xano のようなノーコードバックエンド構築基盤を  
**React（フロントエンド） + Go（バックエンド）** を用いて開発する。

開発における基本ルールは以下とする。

---

## 1. 開発言語・記述方針  
- 本プロジェクトの **開発コミュニケーションは日本語ベース** とする。  
- コード内のコメント、ドキュメント、仕様書も原則 **日本語で記述**。  
- 外部公開向けに英語が必要な場合は、別途 `docs_en/` を作成する。

---

## 2. 仕様書（agent_docs）との整合性について  
- 本プロジェクトには `agent_docs/` 配下に  
  - システム概要  
  - フロントエンド仕様  
  - バックエンド仕様  
  - アーキテクチャ仕様  
  のドキュメントが存在する。

### コード修正時のルール
- 実装時、**仕様書とコードの挙動が不一致になった場合、必ず仕様書を更新**すること。  
- 新しい機能追加や仕様変更があった場合も、必ず `agent_docs/` 配下を更新する。  
- ドキュメントが古くなることを防止し、AIエージェント／将来の開発者が正確に参照できる状態を維持する。

---

## 3. AI支援開発の方針  
- 開発には Claude / ChatGPT / Cursor などの AI アシスタントを積極的に利用する。  
- ただし **AI の提案は必ず動作検証し、仕様書と整合しているか確認する**こと。  
- 仕様の追加・修正は人間の判断に基づいて行い、記録を残す。

---

## 4. プロジェクト構造（主要ディレクトリ）
```

agent_docs/         … 仕様書類
frontend/           … React SPA（管理UI・フローエディタ）
backend/            … Go API（Auth / Admin / Runtime / FlowEngine）
infra/              … docker-compose / k8s manifest
scripts/            … ビルド・デプロイ用スクリプト

```

---

## 5. ライセンス・知財
- ドキュメント・コードは本プロジェクト内でのみ利用可能。  
- 外部公開する場合は LICENSE ファイルの方針に従う。

---

## 6. 今後の拡張方針（簡易）
- 外部IdP対応（OIDC）
- Workerノード分散構成（Master/Worker）
- Flowエディタの拡張
- Route-based Deployment / Version管理
- Webhook・スケジュールタスク対応

---

本 CLAUDE.md はプロジェクト開発の共通ガイドラインとして扱う。  
仕様変更の際は適宜更新すること。
```

---

# 📁 **agent_docs/ の構成と初期ドキュメント**

以下の4ファイルを用意します：

```
agent_docs/
  system_overview.md
  frontend_spec.md
  backend_spec.md
  architecture_spec.md
```

---

# 📘 **system_overview.md（システム概要）**

```markdown


# 🎨 **frontend_spec.md（フロント仕様）**

```markdown

```

---

# 🛠 **backend_spec.md（バックエンド仕様：Go）**

````markdown


````

---

# 🏛 **architecture_spec.md（アーキテクチャ仕様）**

```markdown


```

---

# ✅ 次にできること

このまま次のステップとして：

* MetaDBのER図を作成
* Go側のディレクトリ構成（`/internal/...`）を設計
* フローエンジンのノード仕様（インターフェース定義）を作る
* API一覧のOpenAPI草案を作成

なども進められます。

どれを先に作成しますか？
