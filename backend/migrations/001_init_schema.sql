-- FlowCore Initial Schema Migration

-- MetaDB: テーブル定義
CREATE TABLE IF NOT EXISTS meta_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- MetaDB: カラム定義
CREATE TABLE IF NOT EXISTS meta_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES meta_tables(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(table_id, name)
);

-- MetaDB: エンドポイント定義
CREATE TABLE IF NOT EXISTS meta_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL UNIQUE,
    flow_definition JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- MetaDB: 認証設定
CREATE TABLE IF NOT EXISTS meta_auth_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_meta_columns_table_id ON meta_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_meta_endpoints_path ON meta_endpoints(path);
CREATE INDEX IF NOT EXISTS idx_meta_endpoints_method ON meta_endpoints(method);

-- デフォルト認証設定の挿入
INSERT INTO meta_auth_settings (method, config) VALUES
('email', '{
    "min_password_length": 8,
    "require_special_char": true,
    "require_number": true,
    "email_verification": true
}'::jsonb)
ON CONFLICT DO NOTHING;

-- サンプルテーブルの作成
INSERT INTO meta_tables (id, name) VALUES
('00000000-0000-0000-0000-000000000001', 'users'),
('00000000-0000-0000-0000-000000000002', 'm_items'),
('00000000-0000-0000-0000-000000000003', 'u_items')
ON CONFLICT DO NOTHING;

-- サンプルカラムの作成
INSERT INTO meta_columns (table_id, name, type, required) VALUES
-- users table
('00000000-0000-0000-0000-000000000001', 'id', 'uuid', true),
('00000000-0000-0000-0000-000000000001', 'email', 'text', true),
('00000000-0000-0000-0000-000000000001', 'created_at', 'timestamp', true),
-- m_items table
('00000000-0000-0000-0000-000000000002', 'id', 'uuid', true),
('00000000-0000-0000-0000-000000000002', 'name', 'text', true),
('00000000-0000-0000-0000-000000000002', 'type', 'text', true),
('00000000-0000-0000-0000-000000000002', 'rarity', 'integer', true),
('00000000-0000-0000-0000-000000000002', 'effect_value', 'integer', true),
-- u_items table
('00000000-0000-0000-0000-000000000003', 'id', 'uuid', true),
('00000000-0000-0000-0000-000000000003', 'user_id', 'uuid', true),
('00000000-0000-0000-0000-000000000003', 'item_id', 'uuid', true),
('00000000-0000-0000-0000-000000000003', 'count', 'integer', true),
('00000000-0000-0000-0000-000000000003', 'obtained_at', 'timestamp', true)
ON CONFLICT DO NOTHING;

-- 実際のユーザーテーブルの作成
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- m_items テーブルの作成
CREATE TABLE IF NOT EXISTS m_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    rarity INTEGER NOT NULL,
    effect_value INTEGER NOT NULL
);

-- u_items テーブルの作成
CREATE TABLE IF NOT EXISTS u_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    item_id UUID NOT NULL REFERENCES m_items(id),
    count INTEGER NOT NULL,
    obtained_at TIMESTAMP NOT NULL DEFAULT NOW()
);
