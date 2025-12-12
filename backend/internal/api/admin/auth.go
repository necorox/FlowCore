package admin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/necorox/FlowCore/backend/internal/database"
	"github.com/necorox/FlowCore/backend/internal/models"
	"github.com/necorox/FlowCore/backend/internal/utils"
)

// AuthHandler は認証管理APIのハンドラー
type AuthHandler struct {
	db *database.DB
}

// NewAuthHandler は新しいAuthHandlerを作成する
func NewAuthHandler(db *database.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// GetSettings は認証設定を取得する
func (h *AuthHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	settings, err := h.getAuthSettings(ctx)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get auth settings: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, settings)
}

// UpdateSettings は認証設定を更新する
func (h *AuthHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req models.UpdateAuthSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondValidationError(w, map[string]string{"body": "Invalid JSON"})
		return
	}

	// バリデーション
	if req.Method == "" {
		utils.RespondValidationError(w, map[string]string{"method": "Method is required"})
		return
	}

	// 設定をJSONに変換
	configJSON, err := json.Marshal(req.Config)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to marshal config: %v", err))
		return
	}

	// 設定を更新（既存のレコードを更新）
	_, err = h.db.ExecContext(ctx, `
		UPDATE meta_auth_settings
		SET method = $1, config = $2, updated_at = NOW()
		WHERE id = (SELECT id FROM meta_auth_settings LIMIT 1)
	`, req.Method, configJSON)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to update auth settings: %v", err))
		return
	}

	// 更新後の設定を取得
	settings, err := h.getAuthSettings(ctx)
	if err != nil {
		utils.RespondInternalError(w, fmt.Sprintf("Failed to get updated auth settings: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, settings)
}

// GetFields はユーザーフィールド一覧を取得する
func (h *AuthHandler) GetFields(w http.ResponseWriter, r *http.Request) {
	// 固定のユーザーフィールドを返す（簡易版）
	fields := []models.AuthField{
		{Name: "email", Type: "text", Required: true},
		{Name: "username", Type: "text", Required: false},
		{Name: "avatar_url", Type: "text", Required: false},
		{Name: "created_at", Type: "timestamp", Required: true},
	}

	utils.RespondJSON(w, http.StatusOK, models.AuthFieldsResponse{Fields: fields})
}

// Helper methods

func (h *AuthHandler) getAuthSettings(ctx context.Context) (*models.AuthSettings, error) {
	query := `
		SELECT id, method, config, created_at, updated_at
		FROM meta_auth_settings
		LIMIT 1
	`
	var settings models.AuthSettings
	var configJSON []byte

	err := h.db.QueryRowContext(ctx, query).Scan(
		&settings.ID,
		&settings.Method,
		&configJSON,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// 設定をデコード
	if err := json.Unmarshal(configJSON, &settings.Config); err != nil {
		return nil, err
	}

	return &settings, nil
}
