# DevContainer トラブルシューティング & リビルドガイド

VS Code上で「Rebuild」オプションが表示されない場合や、環境を完全にリセットして作り直したい場合に、Dockerコマンドを使用して手動でクリーンアップする方法のメモです。

## 1. 現状の確認

まず、稼働中または停止中のコンテナを確認します。

```bash
docker ps -a
```

`devbox` や `flowcore` などの名前がついたコンテナを探してください。

## 2. コンテナの強制停止・削除

DevContainerに関連するコンテナを強制的に停止し、削除します。

```bash
# コンテナ名が 'devbox' の場合
docker rm -f devbox

# プロジェクトに関連するすべてのコンテナを一括で停止・削除する場合 (docker-compose使用時)
docker-compose -f .devcontainer/compose.yaml down --rmi local --volumes --remove-orphans
```

※ `docker-compose` コマンドが使えない場合は `docker compose` (スペース区切り) を試してください。

## 3. ボリュームの削除 (任意)

データベースのデータや依存関係のキャッシュなどを完全にクリアしたい場合は、ボリュームも削除します。

```bash
# ボリューム一覧の確認
docker volume ls

# 特定のボリュームを削除
docker volume rm <ボリューム名>

# 使用されていないすべてのボリュームを一括削除 (注意して実行してください)
docker volume prune
```

## 4. ネットワークのクリーンアップ

ネットワークの競合が疑われる場合は、未使用のネットワークを削除します。

```bash
docker network prune
```

## 5. 強力なキャッシュ削除 (解決しない場合)

上記を行っても解決しない場合、ビルドキャッシュを含めてすべてを削除します。
**注意**: これを実行すると、マシン上のすべての停止中のコンテナ、未使用のネットワーク、ダングリングイメージが削除されます。

```bash
docker system prune -a --volumes
```

## 6. 再構築 (リビルド)

クリーンアップが完了したら、以下のいずれかの方法で再構築を試みます。

### 方法 A: VS Code から
1. VS Code を再起動する。
2. コマンドパレット (`Ctrl+Shift+P` / `F1`) を開く。
3. `Dev Containers: Reopen in Container` または `Dev Containers: Rebuild and Reopen in Container` を実行する。

### 方法 B: ターミナルから (DevContainer CLI がある場合)
```bash
devcontainer up --workspace-folder .
```

### 方法 C: Docker Compose で直接起動確認
設定ファイル (`compose.yaml`) が正しいか確認するために、直接起動してみることも有効です。

```bash
cd .devcontainer
docker-compose up -d
# または
docker compose up -d
```
エラーが出れば、その内容に基づいて `compose.yaml` や `Dockerfile` を修正します。
