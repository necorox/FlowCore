package admin

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/necorox/FlowCore/backend/internal/database"
	"github.com/necorox/FlowCore/backend/internal/models"
	"github.com/necorox/FlowCore/backend/internal/utils"
)

// EndpointsHandler はエンドポイント管理APIのハンドラー
type EndpointsHandler struct {
	db *database.DB
}

// NewEndpointsHandler は新しいEndpointsHandlerを作成する
func NewEndpointsHandler(db *database.DB) *EndpointsHandler {
	return &EndpointsHandler{db: db}
}

// GetAll はすべてのエンドポイントを取得する
func (h *EndpointsHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	endpoints, err := h.getAllEndpoints(ctx)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get endpoints: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, models.EndpointsResponse{Endpoints: endpoints})
}

// GetByID はIDでエンドポイントを取得する
func (h *EndpointsHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	endpointID := chi.URLParam(r, "id")

	endpoint, err := h.getEndpointByID(ctx, endpointID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondNotFound(w, "Endpoint not found")
			return
		}
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get endpoint: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, endpoint)
}

// Create は新しいエンドポイントを作成する
func (h *EndpointsHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req models.CreateEndpointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondValidationError(w, map[string]string{"body": "Invalid JSON"})
		return
	}

	// バリデーション
	if req.Name == "" {
		utils.RespondValidationError(w, map[string]string{"name": "Name is required"})
		return
	}
	if req.Path == "" {
		utils.RespondValidationError(w, map[string]string{"path": "Path is required"})
		return
	}
	if len(req.Flow.Nodes) == 0 {
		utils.RespondValidationError(w, map[string]string{"flow": "At least one node is required"})
		return
	}

	// フロー定義をJSONに変換
	flowJSON, err := json.Marshal(req.Flow)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to marshal flow: %v", err))
		return
	}

	// エンドポイントを作成
	var endpointID string
	err = h.db.QueryRowContext(ctx, `
		INSERT INTO meta_endpoints (name, method, path, flow_definition)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, req.Name, req.Method, req.Path, flowJSON).Scan(&endpointID)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to create endpoint: %v", err))
		return
	}

	// 作成されたエンドポイントを取得
	endpoint, err := h.getEndpointByID(ctx, endpointID)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get created endpoint: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusCreated, endpoint)
}

// Update はエンドポイントを更新する
func (h *EndpointsHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	endpointID := chi.URLParam(r, "id")

	var req models.UpdateEndpointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondValidationError(w, map[string]string{"body": "Invalid JSON"})
		return
	}

	// 既存のエンドポイントを確認
	_, err := h.getEndpointByID(ctx, endpointID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondNotFound(w, "Endpoint not found")
			return
		}
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get endpoint: %v", err))
		return
	}

	// 更新クエリを構築
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Method != "" {
		updates["method"] = req.Method
	}
	if req.Path != "" {
		updates["path"] = req.Path
	}
	if len(req.Flow.Nodes) > 0 {
		flowJSON, err := json.Marshal(req.Flow)
		if err != nil {
			utils.RespondInternalError(w, fmt.Sprintf("Failed to marshal flow: %v", err))
			return
		}
		updates["flow_definition"] = flowJSON
	}

	// 更新を実行
	if len(updates) > 0 {
		query := "UPDATE meta_endpoints SET "
		args := []interface{}{}
		i := 1

		for key, value := range updates {
			if i > 1 {
				query += ", "
			}
			query += fmt.Sprintf("%s = $%d", key, i)
			args = append(args, value)
			i++
		}

		query += fmt.Sprintf(", updated_at = NOW() WHERE id = $%d", i)
		args = append(args, endpointID)

		_, err := h.db.ExecContext(ctx, query, args...)
		if err != nil {
			utils.RespondInternalError(w, fmt.Sprintf("Failed to update endpoint: %v", err))
			return
		}
	}

	// 更新後のエンドポイントを取得
	endpoint, err := h.getEndpointByID(ctx, endpointID)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get updated endpoint: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, endpoint)
}

// Delete はエンドポイントを削除する
func (h *EndpointsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	endpointID := chi.URLParam(r, "id")

	// 存在確認
	_, err := h.getEndpointByID(ctx, endpointID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondNotFound(w, "Endpoint not found")
			return
		}
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get endpoint: %v", err))
		return
	}

	// 削除
	_, err = h.db.ExecContext(ctx, "DELETE FROM meta_endpoints WHERE id = $1", endpointID)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to delete endpoint: %v", err))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Helper methods

func (h *EndpointsHandler) getAllEndpoints(ctx context.Context) ([]models.Endpoint, error) {
	query := `
		SELECT id, name, method, path, flow_definition, created_at, updated_at
		FROM meta_endpoints
		ORDER BY created_at DESC
	`
	rows, err := h.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var endpoints []models.Endpoint
	for rows.Next() {
		var endpoint models.Endpoint
		var flowJSON []byte

		if err := rows.Scan(
			&endpoint.ID,
			&endpoint.Name,
			&endpoint.Method,
			&endpoint.Path,
			&flowJSON,
			&endpoint.CreatedAt,
			&endpoint.UpdatedAt,
		); err != nil {
			return nil, err
		}

		// フロー定義をデコード
		if err := json.Unmarshal(flowJSON, &endpoint.Flow); err != nil {
			return nil, err
		}

		endpoints = append(endpoints, endpoint)
	}

	return endpoints, nil
}

func (h *EndpointsHandler) getEndpointByID(ctx context.Context, endpointID string) (*models.Endpoint, error) {
	query := `
		SELECT id, name, method, path, flow_definition, created_at, updated_at
		FROM meta_endpoints
		WHERE id = $1
	`
	var endpoint models.Endpoint
	var flowJSON []byte

	err := h.db.QueryRowContext(ctx, query, endpointID).Scan(
		&endpoint.ID,
		&endpoint.Name,
		&endpoint.Method,
		&endpoint.Path,
		&flowJSON,
		&endpoint.CreatedAt,
		&endpoint.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// フロー定義をデコード
	if err := json.Unmarshal(flowJSON, &endpoint.Flow); err != nil {
		return nil, err
	}

	return &endpoint, nil
}
