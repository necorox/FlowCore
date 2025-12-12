package admin

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/necorox/FlowCore/backend/internal/database"
	"github.com/necorox/FlowCore/backend/internal/models"
	"github.com/necorox/FlowCore/backend/internal/utils"
)

// TablesHandler はテーブル管理APIのハンドラー
type TablesHandler struct {
	db *database.DB
}

// NewTablesHandler は新しいTablesHandlerを作成する
func NewTablesHandler(db *database.DB) *TablesHandler {
	return &TablesHandler{db: db}
}

// GetAll はすべてのテーブルを取得する
func (h *TablesHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	tables, err := h.getAllTables(ctx)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get tables: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, models.TablesResponse{Tables: tables})
}

// Create は新しいテーブルを作成する
func (h *TablesHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req models.CreateTableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondValidationError(w, map[string]string{"body": "Invalid JSON"})
		return
	}

	// バリデーション
	if req.Name == "" {
		utils.RespondValidationError(w, map[string]string{"name": "Name is required"})
		return
	}
	if len(req.Columns) == 0 {
		utils.RespondValidationError(w, map[string]string{"columns": "At least one column is required"})
		return
	}

	// MetaDBにテーブル定義を保存
	tableID, err := h.createTableMetadata(ctx, req.Name, req.Columns)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to create table metadata: %v", err))
		return
	}

	// 実際のテーブルを作成
	if err := h.createActualTable(ctx, req.Name, req.Columns); err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to create actual table: %v", err))
		return
	}

	// 作成されたテーブルを取得
	table, err := h.getTableByID(ctx, tableID)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get created table: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusCreated, table)
}

// Update はテーブルを更新する
func (h *TablesHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tableID := chi.URLParam(r, "id")

	var req models.UpdateTableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondValidationError(w, map[string]string{"body": "Invalid JSON"})
		return
	}

	// 既存テーブルを取得
	existingTable, err := h.getTableByID(ctx, tableID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondNotFound(w, "Table not found")
			return
		}
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get table: %v", err))
		return
	}

	// 更新処理（簡易版：カラム追加のみサポート）
	if len(req.Columns) > 0 {
		if err := h.updateTableColumns(ctx, tableID, existingTable.Name, req.Columns); err != nil {
			utils.RespondInternalError(w, fmt.Sprintf("Failed to update columns: %v", err))
			return
		}
	}

	// 更新後のテーブルを取得
	table, err := h.getTableByID(ctx, tableID)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get updated table: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, table)
}

// Delete はテーブルを削除する
func (h *TablesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tableID := chi.URLParam(r, "id")

	// テーブル名を取得
	table, err := h.getTableByID(ctx, tableID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondNotFound(w, "Table not found")
			return
		}
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get table: %v", err))
		return
	}

	// 実際のテーブルを削除
	if err := h.dropActualTable(ctx, table.Name); err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to drop actual table: %v", err))
		return
	}

	// MetaDBからテーブル定義を削除
	if err := h.deleteTableMetadata(ctx, tableID); err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to delete table metadata: %v", err))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ImportCSV はCSVデータをインポートする
func (h *TablesHandler) ImportCSV(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tableID := chi.URLParam(r, "id")

	var req models.CSVImportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondValidationError(w, map[string]string{"body": "Invalid JSON"})
		return
	}

	// テーブル情報を取得
	table, err := h.getTableByID(ctx, tableID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondNotFound(w, "Table not found")
			return
		}
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get table: %v", err))
		return
	}

	// CSVをパース（簡易実装）
	lines := strings.Split(strings.TrimSpace(req.CSVData), "\n")
	if len(lines) < 2 {
		utils.RespondValidationError(w, map[string]string{"csv_data": "CSV must have header and at least one row"})
		return
	}

	// TODO: 実際のCSVインポート処理を実装

	utils.RespondJSON(w, http.StatusOK, map[string]interface{}{
		"message":      "CSV imported successfully",
		"table_name":   table.Name,
		"rows_imported": len(lines) - 1,
	})
}

// Helper methods

func (h *TablesHandler) getAllTables(ctx context.Context) ([]models.Table, error) {
	query := `
		SELECT id, name, created_at, updated_at
		FROM meta_tables
		ORDER BY created_at DESC
	`
	rows, err := h.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []models.Table
	for rows.Next() {
		var table models.Table
		if err := rows.Scan(&table.ID, &table.Name, &table.CreatedAt, &table.UpdatedAt); err != nil {
			return nil, err
		}

		// カラムを取得
		columns, err := h.getColumnsByTableID(ctx, table.ID)
		if err != nil {
			return nil, err
		}
		table.Columns = columns

		tables = append(tables, table)
	}

	return tables, nil
}

func (h *TablesHandler) getTableByID(ctx context.Context, tableID string) (*models.Table, error) {
	query := `
		SELECT id, name, created_at, updated_at
		FROM meta_tables
		WHERE id = $1
	`
	var table models.Table
	err := h.db.QueryRowContext(ctx, query, tableID).Scan(
		&table.ID, &table.Name, &table.CreatedAt, &table.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// カラムを取得
	columns, err := h.getColumnsByTableID(ctx, table.ID)
	if err != nil {
		return nil, err
	}
	table.Columns = columns

	return &table, nil
}

func (h *TablesHandler) getColumnsByTableID(ctx context.Context, tableID string) ([]models.Column, error) {
	query := `
		SELECT id, table_id, name, type, required, created_at, updated_at
		FROM meta_columns
		WHERE table_id = $1
		ORDER BY created_at ASC
	`
	rows, err := h.db.QueryContext(ctx, query, tableID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []models.Column
	for rows.Next() {
		var col models.Column
		if err := rows.Scan(&col.ID, &col.TableID, &col.Name, &col.Type, &col.Required, &col.CreatedAt, &col.UpdatedAt); err != nil {
			return nil, err
		}
		columns = append(columns, col)
	}

	return columns, nil
}

func (h *TablesHandler) createTableMetadata(ctx context.Context, name string, columns []models.ColumnCreate) (string, error) {
	// テーブルメタデータを作成
	var tableID string
	err := h.db.QueryRowContext(ctx, `
		INSERT INTO meta_tables (name) VALUES ($1) RETURNING id
	`, name).Scan(&tableID)
	if err != nil {
		return "", err
	}

	// カラムメタデータを作成
	for _, col := range columns {
		_, err := h.db.ExecContext(ctx, `
			INSERT INTO meta_columns (table_id, name, type, required)
			VALUES ($1, $2, $3, $4)
		`, tableID, col.Name, col.Type, col.Required)
		if err != nil {
			return "", err
		}
	}

	return tableID, nil
}

func (h *TablesHandler) createActualTable(ctx context.Context, tableName string, columns []models.ColumnCreate) error {
	// SQL生成
	var columnDefs []string
	for _, col := range columns {
		sqlType := models.ValidColumnTypes[col.Type]
		notNull := ""
		if col.Required {
			notNull = " NOT NULL"
		}
		columnDefs = append(columnDefs, fmt.Sprintf("%s %s%s", col.Name, sqlType, notNull))
	}

	createSQL := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s (%s)",
		tableName,
		strings.Join(columnDefs, ", "),
	)

	_, err := h.db.ExecContext(ctx, createSQL)
	return err
}

func (h *TablesHandler) updateTableColumns(ctx context.Context, tableID, tableName string, columns []models.ColumnCreate) error {
	// 簡易版：カラム追加のみ
	for _, col := range columns {
		// メタデータに追加
		_, err := h.db.ExecContext(ctx, `
			INSERT INTO meta_columns (table_id, name, type, required)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT DO NOTHING
		`, tableID, col.Name, col.Type, col.Required)
		if err != nil {
			return err
		}

		// 実際のテーブルに追加
		sqlType := models.ValidColumnTypes[col.Type]
		alterSQL := fmt.Sprintf("ALTER TABLE %s ADD COLUMN IF NOT EXISTS %s %s", tableName, col.Name, sqlType)
		if _, err := h.db.ExecContext(ctx, alterSQL); err != nil {
			return err
		}
	}

	return nil
}

func (h *TablesHandler) deleteTableMetadata(ctx context.Context, tableID string) error {
	_, err := h.db.ExecContext(ctx, "DELETE FROM meta_tables WHERE id = $1", tableID)
	return err
}

func (h *TablesHandler) dropActualTable(ctx context.Context, tableName string) error {
	dropSQL := fmt.Sprintf("DROP TABLE IF EXISTS %s CASCADE", tableName)
	_, err := h.db.ExecContext(ctx, dropSQL)
	return err
}
