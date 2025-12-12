package models

import "time"

// AuthSettings は認証設定を表す
type AuthSettings struct {
	ID        string                 `json:"id"`
	Method    string                 `json:"method"`
	Config    map[string]interface{} `json:"config"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
}

// UpdateAuthSettingsRequest は認証設定更新リクエスト
type UpdateAuthSettingsRequest struct {
	Method string                 `json:"method" validate:"required,oneof=email oauth"`
	Config map[string]interface{} `json:"config" validate:"required"`
}

// AuthField はユーザーフィールドを表す
type AuthField struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Required bool   `json:"required"`
}

// AuthFieldsResponse はユーザーフィールド一覧レスポンス
type AuthFieldsResponse struct {
	Fields []AuthField `json:"fields"`
}
