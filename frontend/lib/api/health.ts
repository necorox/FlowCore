import { apiClient } from "../api-client"
import type { ApiResponse } from "../types"

/**
 * ヘルスチェック
 */
export async function healthCheck(): Promise<ApiResponse<string>> {
  return apiClient.get<string>("/health")
}
