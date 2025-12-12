package utils

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse はエラーレスポンスの構造
type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

// ErrorDetail はエラー詳細
type ErrorDetail struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// RespondJSON はJSONレスポンスを返す
func RespondJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// RespondError はエラーレスポンスを返す
func RespondError(w http.ResponseWriter, statusCode int, code string, message string, details interface{}) {
	response := ErrorResponse{
		Error: ErrorDetail{
			Code:    code,
			Message: message,
			Details: details,
		},
	}
	RespondJSON(w, statusCode, response)
}

// RespondValidationError はバリデーションエラーレスポンスを返す
func RespondValidationError(w http.ResponseWriter, details interface{}) {
	RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request parameters", details)
}

// RespondNotFound はリソース未検出エラーを返す
func RespondNotFound(w http.ResponseWriter, message string) {
	RespondError(w, http.StatusNotFound, "NOT_FOUND", message, nil)
}

// RespondInternalError はサーバー内部エラーを返す
func RespondInternalError(w http.ResponseWriter, message string) {
	RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", message, nil)
}
