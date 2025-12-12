package models

import "time"

// Table はデータベーステーブルのメタデータを表す
type Table struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Columns   []Column  `json:"columns"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateTableRequest はテーブル作成リクエスト
type CreateTableRequest struct {
	Name    string         `json:"name" validate:"required"`
	Columns []ColumnCreate `json:"columns" validate:"required,min=1"`
}

// UpdateTableRequest はテーブル更新リクエスト
type UpdateTableRequest struct {
	Name    string         `json:"name"`
	Columns []ColumnCreate `json:"columns"`
}

// TablesResponse はテーブル一覧レスポンス
type TablesResponse struct {
	Tables []Table `json:"tables"`
}

// CSVImportRequest はCSVインポートリクエスト
type CSVImportRequest struct {
	CSVData string `json:"csv_data" validate:"required"`
}
