import { apiClient } from "../api-client"
import type {
  Endpoint,
  EndpointsResponse,
  CreateEndpointRequest,
  UpdateEndpointRequest,
  ApiResponse,
} from "../types"

/**
 * エンドポイント一覧を取得
 */
export async function getEndpoints(): Promise<ApiResponse<EndpointsResponse>> {
  return apiClient.get<EndpointsResponse>("/admin/endpoints")
}

/**
 * エンドポイント詳細を取得
 */
export async function getEndpoint(id: string): Promise<ApiResponse<Endpoint>> {
  return apiClient.get<Endpoint>(`/admin/endpoints/${id}`)
}

/**
 * エンドポイントを作成
 */
export async function createEndpoint(
  data: CreateEndpointRequest
): Promise<ApiResponse<Endpoint>> {
  return apiClient.post<Endpoint>("/admin/endpoints", data)
}

/**
 * エンドポイントを更新
 */
export async function updateEndpoint(
  id: string,
  data: UpdateEndpointRequest
): Promise<ApiResponse<Endpoint>> {
  return apiClient.put<Endpoint>(`/admin/endpoints/${id}`, data)
}

/**
 * エンドポイントを削除
 */
export async function deleteEndpoint(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<{ message: string }>(`/admin/endpoints/${id}`)
}

/**
 * 動的エンドポイントを実行（テスト用）
 */
export async function executeEndpoint(
  path: string,
  method: string = "GET",
  body?: any
): Promise<ApiResponse<any>> {
  const endpoint = `/api${path}`

  switch (method.toUpperCase()) {
    case "GET":
      return apiClient.get(endpoint)
    case "POST":
      return apiClient.post(endpoint, body)
    case "PUT":
      return apiClient.put(endpoint, body)
    case "DELETE":
      return apiClient.delete(endpoint)
    case "PATCH":
      return apiClient.patch(endpoint, body)
    default:
      return {
        success: false,
        error: `Unsupported HTTP method: ${method}`,
      }
  }
}
