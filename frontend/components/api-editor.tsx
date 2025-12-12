"use client"

import { useState, useEffect } from "react"
import { Plus, Play, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NodeCanvas } from "@/components/node-canvas"
import { getEndpoints, createEndpoint, updateEndpoint, deleteEndpoint as deleteEndpointApi, executeEndpoint } from "@/lib/api"
import type { Endpoint, HttpMethod, Flow } from "@/lib/types"

export function ApiEditor() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  // 初期読み込み
  useEffect(() => {
    loadEndpoints()
  }, [])

  const loadEndpoints = async () => {
    setLoading(true)
    setError(null)
    const result = await getEndpoints()

    if (result.success) {
      setEndpoints(result.data.endpoints)
      if (result.data.endpoints.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(result.data.endpoints[0].id)
      }
    } else {
      setError(result.error)
      console.error("Failed to load endpoints:", result.error)
    }
    setLoading(false)
  }

  const addEndpoint = async () => {
    const name = prompt("エンドポイント名を入力してください:", "New Endpoint")
    if (!name) return

    const path = prompt("パスを入力してください:", "/endpoint")
    if (!path) return

    // デフォルトのフロー定義
    const defaultFlow: Flow = {
      nodes: [
        {
          id: "start-1",
          type: "start",
          label: "開始",
          x: 100,
          y: 100,
          config: {},
          pins: [
            {
              id: "start-1-output",
              node_id: "start-1",
              type: "output",
              data_type: "trigger",
              label: "実行",
            },
          ],
        },
      ],
      connections: [],
    }

    const result = await createEndpoint({
      name,
      method: "GET",
      path,
      flow: defaultFlow,
    })

    if (result.success) {
      await loadEndpoints()
      setSelectedEndpoint(result.data.id)
    } else {
      alert(`エンドポイントの作成に失敗しました: ${result.error}`)
    }
  }

  const handleDeleteEndpoint = async (id: string) => {
    const endpoint = endpoints.find((e) => e.id === id)
    if (!endpoint) return

    if (!confirm(`エンドポイント "${endpoint.name}" を削除しますか？`)) return

    const result = await deleteEndpointApi(id)

    if (result.success) {
      await loadEndpoints()
      if (selectedEndpoint === id) {
        setSelectedEndpoint(null)
      }
    } else {
      alert(`エンドポイントの削除に失敗しました: ${result.error}`)
    }
  }

  const updateEndpointMethod = async (method: HttpMethod) => {
    if (!selectedEndpoint) return

    const result = await updateEndpoint(selectedEndpoint, { method })

    if (result.success) {
      await loadEndpoints()
      setSelectedEndpoint(selectedEndpoint)
    } else {
      alert(`メソッドの更新に失敗しました: ${result.error}`)
    }
  }

  const updateEndpointPath = async (path: string) => {
    if (!selectedEndpoint) return

    // debounceのため、ローカルだけ更新
    setEndpoints(endpoints.map((e) => (e.id === selectedEndpoint ? { ...e, path } : e)))
  }

  const handlePathBlur = async () => {
    if (!selectedEndpoint) return
    const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint)
    if (!currentEndpoint) return

    const result = await updateEndpoint(selectedEndpoint, {
      path: currentEndpoint.path,
    })

    if (!result.success) {
      alert(`パスの更新に失敗しました: ${result.error}`)
      await loadEndpoints() // 元に戻す
    }
  }

  const handleTestEndpoint = async () => {
    if (!selectedEndpoint) return
    const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint)
    if (!currentEndpoint) return

    setTestResult(null)
    const result = await executeEndpoint(currentEndpoint.path, currentEndpoint.method)

    if (result.success) {
      setTestResult({ success: true, data: result.data })
      alert(`テスト成功:\n${JSON.stringify(result.data, null, 2)}`)
    } else {
      setTestResult({ success: false, error: result.error })
      alert(`テスト失敗: ${result.error}`)
    }
  }

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint)

  const methodColors = {
    GET: "bg-accent text-accent-foreground",
    POST: "bg-primary text-primary-foreground",
    PUT: "bg-chart-3 text-primary-foreground",
    DELETE: "bg-destructive text-destructive-foreground",
    PATCH: "bg-chart-2 text-primary-foreground",
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">エラー: {error}</p>
          <Button onClick={loadEndpoints}>再読み込み</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-card-foreground">エンドポイント</h2>
          <Button size="sm" onClick={addEndpoint} className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-2 space-y-1">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-colors ${selectedEndpoint === endpoint.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
                }`}
            >
              <button
                onClick={() => setSelectedEndpoint(endpoint.id)}
                className="flex-1 flex items-center gap-2 text-left"
              >
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${methodColors[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <span className="truncate">{endpoint.name}</span>
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteEndpoint(endpoint.id)
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {currentEndpoint ? (
          <>
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-4">
                <Select value={currentEndpoint.method} onValueChange={updateEndpointMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={currentEndpoint.path}
                  onChange={(e) => updateEndpointPath(e.target.value)}
                  onBlur={handlePathBlur}
                  className="flex-1"
                  placeholder="/api/endpoint"
                />
                <Button onClick={handleTestEndpoint}>
                  <Play className="w-4 h-4 mr-2" />
                  テスト
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <NodeCanvas key={currentEndpoint.id} endpointId={currentEndpoint.id} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">エンドポイントを選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
