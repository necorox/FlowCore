// FlowCore API 型定義

// ============================================
// Table関連
// ============================================

export type ColumnType = "text" | "integer" | "uuid" | "timestamp" | "boolean" | "json"

export interface Column {
  id: string
  table_id: string
  name: string
  type: ColumnType
  required: boolean
  created_at: string
  updated_at: string
}

export interface ColumnCreate {
  name: string
  type: ColumnType
  required?: boolean
}

export interface Table {
  id: string
  name: string
  columns: Column[]
  created_at: string
  updated_at: string
}

export interface CreateTableRequest {
  name: string
  columns: ColumnCreate[]
}

export interface UpdateTableRequest {
  name?: string
  columns?: ColumnCreate[]
}

export interface TablesResponse {
  tables: Table[]
}

export interface CSVImportRequest {
  csv_data: string
}

// ============================================
// Endpoint関連
// ============================================

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
export type NodeType = "start" | "database" | "filter" | "response" | "process"
export type PinType = "input" | "output"

export interface PinRef {
  node_id: string
  pin_id: string
}

export interface Pin {
  id: string
  node_id: string
  type: PinType
  data_type: string
  label: string
}

export interface Node {
  id: string
  type: NodeType
  label: string
  x: number
  y: number
  config: Record<string, any>
  pins: Pin[]
}

export interface Connection {
  id: string
  from: PinRef
  to: PinRef
}

export interface Flow {
  nodes: Node[]
  connections: Connection[]
}

export interface Endpoint {
  id: string
  name: string
  method: HttpMethod
  path: string
  flow: Flow
  created_at: string
  updated_at: string
}

export interface CreateEndpointRequest {
  name: string
  method: HttpMethod
  path: string
  flow: Flow
}

export interface UpdateEndpointRequest {
  name?: string
  method?: HttpMethod
  path?: string
  flow?: Flow
}

export interface EndpointsResponse {
  endpoints: Endpoint[]
}

// ============================================
// Auth関連
// ============================================

export type AuthMethod = "email" | "oauth"

export interface AuthSettings {
  id: string
  method: AuthMethod
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UpdateAuthSettingsRequest {
  method: AuthMethod
  config: Record<string, any>
}

export interface AuthField {
  name: string
  type: string
  required: boolean
}

export interface AuthFieldsResponse {
  fields: AuthField[]
}

// ============================================
// エラーレスポンス
// ============================================

export interface ErrorResponse {
  error: string
}

// ============================================
// API レスポンス型
// ============================================

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
