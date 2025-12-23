"use client"

import { useState } from "react"
import { X, Trash2, Database, Filter, ArrowRight, Send, Plus, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import type { Node, Pin, NodeType } from "@/lib/types"

interface NodeEditorPanelProps {
  node: Node
  onClose: () => void
  onUpdate: (config: Record<string, any>) => void
  onDelete: () => void
  availableOutputPins?: Array<{ nodeId: string; nodeLabel: string; pin: Pin }>
  allNodes?: Node[]
}

export function NodeEditorPanel({
  node,
  onClose,
  onUpdate,
  onDelete,
  availableOutputPins = [],
  allNodes = [],
}: NodeEditorPanelProps) {
  const [config, setConfig] = useState(node.config || {})

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onUpdate(newConfig)
  }

  const addParameter = () => {
    const params = config.params || []
    updateConfig("params", [...params, `param${params.length + 1}`])
  }

  const removeParameter = (index: number) => {
    const params = config.params || []
    updateConfig(
      "params",
      params.filter((_: any, i: number) => i !== index),
    )
  }

  const updateParameter = (index: number, value: string) => {
    const params = [...(config.params || [])]
    params[index] = value
    updateConfig("params", params)
  }

  const nodeIcons: Record<Node["type"], any> = {
    start: ArrowRight,
    database: Database,
    filter: Filter,
    response: Send,
    process: Code,
  }

  const Icon = nodeIcons[node.type]

  const renderEditor = () => {
    switch (node.type) {
      case "start":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>HTTPメソッド</Label>
              <Select value={config.method || "GET"} onValueChange={(value) => updateConfig("method", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>リクエストパラメータ</Label>
                <Button size="sm" variant="outline" onClick={addParameter}>
                  <Plus className="w-3 h-3 mr-1" />
                  追加
                </Button>
              </div>
              <div className="space-y-2">
                {(config.params || []).map((param: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={param}
                      onChange={(e) => updateParameter(index, e.target.value)}
                      placeholder="パラメータ名"
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeParameter(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "database":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>データベース</Label>
              <Select value={config.database || ""} onValueChange={(value) => updateConfig("database", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="データベースを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="analytics">analytics</SelectItem>
                  <SelectItem value="logs">logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>テーブル</Label>
              <Select value={config.table || ""} onValueChange={(value) => updateConfig("table", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="テーブルを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">users</SelectItem>
                  <SelectItem value="posts">posts</SelectItem>
                  <SelectItem value="comments">comments</SelectItem>
                  <SelectItem value="products">products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>操作</Label>
              <Select value={config.operation || "select"} onValueChange={(value) => updateConfig("operation", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">SELECT</SelectItem>
                  <SelectItem value="insert">INSERT</SelectItem>
                  <SelectItem value="update">UPDATE</SelectItem>
                  <SelectItem value="delete">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>カラム選択</Label>
              <div className="border border-border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {["id", "email", "name", "created_at", "updated_at"].map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <Checkbox
                      id={`col-${col}`}
                      checked={(config.columns || []).includes(col)}
                      onCheckedChange={(checked) => {
                        const cols = config.columns || []
                        if (checked) {
                          updateConfig("columns", [...cols, col])
                        } else {
                          updateConfig(
                            "columns",
                            cols.filter((c: string) => c !== col),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`col-${col}`} className="text-sm font-normal cursor-pointer">
                      {col}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "process":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>処理タイプ</Label>
              <Select
                value={config.processType || "script"}
                onValueChange={(value) => updateConfig("processType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="script">スクリプト</SelectItem>
                  <SelectItem value="condition">条件分岐</SelectItem>
                  <SelectItem value="random">ランダム生成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>処理スクリプト (JavaScript)</Label>
              <Textarea
                placeholder="例: return Math.floor(Math.random() * 100) + 1;"
                value={config.script || ""}
                onChange={(e) => updateConfig("script", e.target.value)}
                className="font-mono text-sm min-h-[120px]"
              />
            </div>
          </div>
        )

      case "filter":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>変換タイプ</Label>
              <Select
                value={config.transformType || "map"}
                onValueChange={(value) => updateConfig("transformType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">マップ</SelectItem>
                  <SelectItem value="filter">フィルター</SelectItem>
                  <SelectItem value="reduce">集約</SelectItem>
                  <SelectItem value="sort">ソート</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>変換スクリプト (JavaScript)</Label>
              <Textarea
                placeholder="例: data.map(item => ({ ...item, fullName: item.firstName + ' ' + item.lastName }))"
                value={config.script || ""}
                onChange={(e) => updateConfig("script", e.target.value)}
                className="font-mono text-sm min-h-[120px]"
              />
            </div>
          </div>
        )

      case "response":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ステータスコード</Label>
              <Select value={config.statusCode || "200"} onValueChange={(value) => updateConfig("statusCode", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">200 OK</SelectItem>
                  <SelectItem value="201">201 Created</SelectItem>
                  <SelectItem value="400">400 Bad Request</SelectItem>
                  <SelectItem value="401">401 Unauthorized</SelectItem>
                  <SelectItem value="404">404 Not Found</SelectItem>
                  <SelectItem value="500">500 Internal Server Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>レスポンスに含めるデータ</Label>
              <div className="border border-border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto bg-background/50">
                {availableOutputPins.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">利用可能なデータがありません</p>
                ) : (
                  availableOutputPins.map(({ nodeId, nodeLabel, pin }) => (
                    <div key={pin.id} className="flex items-start gap-2 p-2 rounded hover:bg-secondary/50">
                      <Checkbox
                        id={`pin-${pin.id}`}
                        checked={(config.selectedFields || []).includes(pin.id)}
                        onCheckedChange={(checked) => {
                          const fields = config.selectedFields || []
                          if (checked) {
                            updateConfig("selectedFields", [...fields, pin.id])
                          } else {
                            updateConfig(
                              "selectedFields",
                              fields.filter((f: string) => f !== pin.id),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={`pin-${pin.id}`} className="text-sm font-normal cursor-pointer flex-1">
                        <div className="font-medium">{nodeLabel}</div>
                        <div className="text-xs text-muted-foreground">{pin.label}</div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>レスポンス形式</Label>
              <Select value={config.format || "json"} onValueChange={(value) => updateConfig("format", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="text">テキスト</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{node.label}</h3>
            <p className="text-xs text-muted-foreground">ID: {node.id}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Card className="p-4 bg-background">{renderEditor()}</Card>
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="destructive" className="w-full" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          ノードを削除
        </Button>
      </div>
    </div>
  )
}
