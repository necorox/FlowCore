import { apiClient } from "../api-client"
import type {
  Table,
  TablesResponse,
  CreateTableRequest,
  UpdateTableRequest,
  CSVImportRequest,
  ApiResponse,
} from "../types"

/**
 * テーブル一覧を取得
 */
export async function getTables(): Promise<ApiResponse<TablesResponse>> {
  return apiClient.get<TablesResponse>("/admin/tables")
}

/**
 * テーブルを作成
 */
export async function createTable(
  data: CreateTableRequest
): Promise<ApiResponse<Table>> {
  return apiClient.post<Table>("/admin/tables", data)
}

/**
 * テーブルを更新
 */
export async function updateTable(
  id: string,
  data: UpdateTableRequest
): Promise<ApiResponse<Table>> {
  return apiClient.put<Table>(`/admin/tables/${id}`, data)
}

/**
 * テーブルを削除
 */
export async function deleteTable(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<{ message: string }>(`/admin/tables/${id}`)
}

/**
 * CSVデータをインポート
 */
export async function importCSV(
  id: string,
  data: CSVImportRequest
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.post<{ message: string }>(`/admin/tables/${id}/import`, data)
}
