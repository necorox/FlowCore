package runtime

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/necorox/FlowCore/backend/internal/database"
	"github.com/necorox/FlowCore/backend/internal/utils"
)

// Handler はRuntime APIのハンドラー
type Handler struct {
	db *database.DB
}

// NewHandler は新しいHandlerを作成する
func NewHandler(db *database.DB) *Handler {
	return &Handler{db: db}
}

// Execute は動的エンドポイントを実行する
// 現時点では簡易実装（モック）
func (h *Handler) Execute(w http.ResponseWriter, r *http.Request) {
	// リクエストパスとメソッドを取得
	path := r.URL.Path
	method := r.Method

	// エンドポイント定義を取得
	endpoint, err := h.getEndpointByPath(r.Context(), method, path)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondNotFound(w, "Endpoint not found")
			return
		}
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get endpoint: %v", err))
		return
	}

	// TODO: フローエンジンでエンドポイントを実行
	// 現時点ではモックレスポンスを返す
	utils.RespondJSON(w, http.StatusOK, map[string]interface{}{
		"message":      "Flow execution not yet implemented",
		"endpoint_id":  endpoint.ID,
		"endpoint_name": endpoint.Name,
		"method":       endpoint.Method,
		"path":         endpoint.Path,
	})
}

// Helper methods

type endpointInfo struct {
	ID     string
	Name   string
	Method string
	Path   string
}

func (h *Handler) getEndpointByPath(ctx context.Context, method, path string) (*endpointInfo, error) {
	query := `
		SELECT id, name, method, path
		FROM meta_endpoints
		WHERE method = $1 AND path = $2
		LIMIT 1
	`
	var endpoint endpointInfo
	err := h.db.QueryRowContext(ctx, query, method, path).Scan(
		&endpoint.ID,
		&endpoint.Name,
		&endpoint.Method,
		&endpoint.Path,
	)
	if err != nil {
		return nil, err
	}

	return &endpoint, nil
}
