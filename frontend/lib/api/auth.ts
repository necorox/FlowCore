import { apiClient } from "../api-client"
import type {
  AuthSettings,
  UpdateAuthSettingsRequest,
  AuthFieldsResponse,
  ApiResponse,
} from "../types"

/**
 * 認証設定を取得
 */
export async function getAuthSettings(): Promise<ApiResponse<AuthSettings>> {
  return apiClient.get<AuthSettings>("/admin/auth/settings")
}

/**
 * 認証設定を更新
 */
export async function updateAuthSettings(
  data: UpdateAuthSettingsRequest
): Promise<ApiResponse<AuthSettings>> {
  return apiClient.put<AuthSettings>("/admin/auth/settings", data)
}

/**
 * ユーザーフィールド一覧を取得
 */
export async function getAuthFields(): Promise<ApiResponse<AuthFieldsResponse>> {
  return apiClient.get<AuthFieldsResponse>("/admin/auth/fields")
}
