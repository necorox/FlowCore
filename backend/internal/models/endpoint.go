package models

import "time"

// Endpoint はAPIエンドポイントのメタデータを表す
type Endpoint struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Method    string    `json:"method"`
	Path      string    `json:"path"`
	Flow      Flow      `json:"flow"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateEndpointRequest はエンドポイント作成リクエスト
type CreateEndpointRequest struct {
	Name   string `json:"name" validate:"required"`
	Method string `json:"method" validate:"required,oneof=GET POST PUT DELETE PATCH"`
	Path   string `json:"path" validate:"required"`
	Flow   Flow   `json:"flow" validate:"required"`
}

// UpdateEndpointRequest はエンドポイント更新リクエスト
type UpdateEndpointRequest struct {
	Name   string `json:"name"`
	Method string `json:"method" validate:"omitempty,oneof=GET POST PUT DELETE PATCH"`
	Path   string `json:"path"`
	Flow   Flow   `json:"flow"`
}

// EndpointsResponse はエンドポイント一覧レスポンス
type EndpointsResponse struct {
	Endpoints []Endpoint `json:"endpoints"`
}
