-- FlowCore Seed Data Migration
-- モックデータを追加

-- サンプルユーザーデータ
INSERT INTO users (id, email, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'alice@example.com', NOW()),
('22222222-2222-2222-2222-222222222222', 'bob@example.com', NOW()),
('33333333-3333-3333-3333-333333333333', 'charlie@example.com', NOW())
ON CONFLICT DO NOTHING;

-- サンプルアイテムマスターデータ
INSERT INTO m_items (id, name, type, rarity, effect_value) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ヒールポーション', 'potion', 1, 50),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'マナポーション', 'potion', 1, 30),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '鉄の剣', 'weapon', 2, 20),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '鋼の盾', 'armor', 2, 15),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'エリクサー', 'potion', 3, 100),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '伝説の剣', 'weapon', 5, 150)
ON CONFLICT DO NOTHING;

-- サンプルユーザーアイテムデータ
INSERT INTO u_items (user_id, item_id, count, obtained_at) VALUES
-- Alice のアイテム
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, NOW() - INTERVAL '1 day'),
-- Bob のアイテム
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10, NOW() - INTERVAL '3 days'),
('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, NOW()),
-- Charlie のアイテム
('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1, NOW() - INTERVAL '5 days'),
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 20, NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- サンプルAPIエンドポイント定義
INSERT INTO meta_endpoints (id, name, method, path, flow_definition, created_at, updated_at) VALUES
-- ユーザー一覧取得エンドポイント
('00000001-0000-0000-0000-000000000001', 'ユーザー一覧取得', 'GET', '/users/list', '{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "label": "開始",
      "x": 100,
      "y": 100,
      "config": {},
      "pins": [
        {
          "id": "start-1-output",
          "node_id": "start-1",
          "type": "output",
          "data_type": "trigger",
          "label": "実行"
        }
      ]
    },
    {
      "id": "db-1",
      "type": "database",
      "label": "ユーザー取得",
      "x": 400,
      "y": 100,
      "config": {
        "table": "users",
        "operation": "select",
        "columns": ["id", "email", "created_at"]
      },
      "pins": [
        {
          "id": "db-1-input",
          "node_id": "db-1",
          "type": "input",
          "data_type": "trigger",
          "label": "実行"
        },
        {
          "id": "db-1-output",
          "node_id": "db-1",
          "type": "output",
          "data_type": "array",
          "label": "結果"
        }
      ]
    },
    {
      "id": "response-1",
      "type": "response",
      "label": "レスポンス",
      "x": 700,
      "y": 100,
      "config": {
        "status": 200
      },
      "pins": [
        {
          "id": "response-1-input",
          "node_id": "response-1",
          "type": "input",
          "data_type": "object",
          "label": "データ"
        }
      ]
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": {
        "node_id": "start-1",
        "pin_id": "start-1-output"
      },
      "to": {
        "node_id": "db-1",
        "pin_id": "db-1-input"
      }
    },
    {
      "id": "conn-2",
      "from": {
        "node_id": "db-1",
        "pin_id": "db-1-output"
      },
      "to": {
        "node_id": "response-1",
        "pin_id": "response-1-input"
      }
    }
  ]
}'::jsonb, NOW(), NOW()),

-- アイテム一覧取得エンドポイント
('00000002-0000-0000-0000-000000000002', 'アイテムマスター一覧取得', 'GET', '/items/master', '{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "label": "開始",
      "x": 100,
      "y": 100,
      "config": {},
      "pins": [
        {
          "id": "start-1-output",
          "node_id": "start-1",
          "type": "output",
          "data_type": "trigger",
          "label": "実行"
        }
      ]
    },
    {
      "id": "db-1",
      "type": "database",
      "label": "アイテム取得",
      "x": 400,
      "y": 100,
      "config": {
        "table": "m_items",
        "operation": "select",
        "columns": ["id", "name", "type", "rarity", "effect_value"],
        "orderBy": "rarity DESC"
      },
      "pins": [
        {
          "id": "db-1-input",
          "node_id": "db-1",
          "type": "input",
          "data_type": "trigger",
          "label": "実行"
        },
        {
          "id": "db-1-output",
          "node_id": "db-1",
          "type": "output",
          "data_type": "array",
          "label": "結果"
        }
      ]
    },
    {
      "id": "response-1",
      "type": "response",
      "label": "レスポンス",
      "x": 700,
      "y": 100,
      "config": {
        "status": 200
      },
      "pins": [
        {
          "id": "response-1-input",
          "node_id": "response-1",
          "type": "input",
          "data_type": "object",
          "label": "データ"
        }
      ]
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": {
        "node_id": "start-1",
        "pin_id": "start-1-output"
      },
      "to": {
        "node_id": "db-1",
        "pin_id": "db-1-input"
      }
    },
    {
      "id": "conn-2",
      "from": {
        "node_id": "db-1",
        "pin_id": "db-1-output"
      },
      "to": {
        "node_id": "response-1",
        "pin_id": "response-1-input"
      }
    }
  ]
}'::jsonb, NOW(), NOW()),

-- ユーザーアイテム取得エンドポイント
('00000003-0000-0000-0000-000000000003', 'ユーザーアイテム取得', 'GET', '/users/{user_id}/items', '{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "label": "開始",
      "x": 100,
      "y": 100,
      "config": {},
      "pins": [
        {
          "id": "start-1-output",
          "node_id": "start-1",
          "type": "output",
          "data_type": "trigger",
          "label": "実行"
        }
      ]
    },
    {
      "id": "db-1",
      "type": "database",
      "label": "ユーザーアイテム取得",
      "x": 400,
      "y": 100,
      "config": {
        "table": "u_items",
        "operation": "select",
        "columns": ["id", "user_id", "item_id", "count", "obtained_at"],
        "where": {
          "user_id": "{{params.user_id}}"
        }
      },
      "pins": [
        {
          "id": "db-1-input",
          "node_id": "db-1",
          "type": "input",
          "data_type": "trigger",
          "label": "実行"
        },
        {
          "id": "db-1-output",
          "node_id": "db-1",
          "type": "output",
          "data_type": "array",
          "label": "結果"
        }
      ]
    },
    {
      "id": "response-1",
      "type": "response",
      "label": "レスポンス",
      "x": 700,
      "y": 100,
      "config": {
        "status": 200
      },
      "pins": [
        {
          "id": "response-1-input",
          "node_id": "response-1",
          "type": "input",
          "data_type": "object",
          "label": "データ"
        }
      ]
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": {
        "node_id": "start-1",
        "pin_id": "start-1-output"
      },
      "to": {
        "node_id": "db-1",
        "pin_id": "db-1-input"
      }
    },
    {
      "id": "conn-2",
      "from": {
        "node_id": "db-1",
        "pin_id": "db-1-output"
      },
      "to": {
        "node_id": "response-1",
        "pin_id": "response-1-input"
      }
    }
  ]
}'::jsonb, NOW(), NOW())

ON CONFLICT DO NOTHING;
