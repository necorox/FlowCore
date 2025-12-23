#!/usr/bin/env bash
set -euo pipefail

# This script brings up infra containers used for local dev.
# It creates the shared Docker network if missing and starts
# Postgres/pgAdmin and Redis/Redis Commander stacks.

SCRIPT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
NETWORK_NAME="devnet"
COMPOSE_FILES=(
  "$SCRIPT_DIR/compose.data.postgres.yaml"
  "$SCRIPT_DIR/compose.data.redis.yaml"
)

# Ensure the shared network exists (compose files expect it)
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  docker network create "$NETWORK_NAME"
fi

# Build docker compose arguments with absolute paths
COMPOSE_ARGS=()
for file in "${COMPOSE_FILES[@]}"; do
  COMPOSE_ARGS+=(-f "$file")
done

docker compose "${COMPOSE_ARGS[@]}" up -d --remove-orphans

echo "Infra started. Stacks: Postgres/pgAdmin and Redis/Redis Commander."

