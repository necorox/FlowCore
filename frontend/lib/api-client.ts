import type { ApiResponse } from "./types"

// APIベースURL（環境変数から取得、デフォルトはlocalhost）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// HTTPメソッド型
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

// リクエストオプション
interface RequestOptions {
  method?: HttpMethod
  body?: any
  headers?: Record<string, string>
}

/**
 * APIクライアントのコアクラス
 */
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * 汎用的なHTTPリクエストメソッド
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {} } = options

    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }

    if (body && method !== "GET") {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, config)

      // レスポンスのContent-Typeを確認
      const contentType = response.headers.get("content-type")
      const isJson = contentType?.includes("application/json")

      // ステータスコードが2xxでない場合
      if (!response.ok) {
        if (isJson) {
          const errorData = await response.json()
          return {
            success: false,
            error: errorData.error || `HTTP Error: ${response.status}`,
          }
        } else {
          const errorText = await response.text()
          return {
            success: false,
            error: errorText || `HTTP Error: ${response.status}`,
          }
        }
      }

      // 成功レスポンスの場合
      if (isJson) {
        const data = await response.json()
        return { success: true, data }
      } else {
        // JSONでない場合（例: /health エンドポイント）
        const text = await response.text()
        return { success: true, data: text as T }
      }
    } catch (error) {
      console.error("API request failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  /**
   * GETリクエスト
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", headers })
  }

  /**
   * POSTリクエスト
   */
  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, headers })
  }

  /**
   * PUTリクエスト
   */
  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, headers })
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers })
  }

  /**
   * PATCHリクエスト
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PATCH", body, headers })
  }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient(API_BASE_URL)

// 型をエクスポート
export type { ApiResponse }
