package models

import "time"

// Column はテーブルカラムのメタデータを表す
type Column struct {
	ID       string    `json:"id"`
	TableID  string    `json:"table_id"`
	Name     string    `json:"name"`
	Type     string    `json:"type"`
	Required bool      `json:"required"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ColumnCreate はカラム作成用の構造体
type ColumnCreate struct {
	Name     string `json:"name" validate:"required"`
	Type     string `json:"type" validate:"required,oneof=text integer uuid timestamp boolean json"`
	Required bool   `json:"required"`
}

// ValidColumnTypes はサポートされるカラムタイプ
var ValidColumnTypes = map[string]string{
	"text":      "TEXT",
	"integer":   "INTEGER",
	"uuid":      "UUID",
	"timestamp": "TIMESTAMP",
	"boolean":   "BOOLEAN",
	"json":      "JSONB",
}
