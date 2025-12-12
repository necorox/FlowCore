"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Database, Filter, ArrowRight, Send, Plus, Code, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NodeEditorPanel } from "@/components/node-editor-panel"

/**
 * ==============================
 * Types
 * ==============================
 */
interface Pin {
  id: string
  nodeId: string
  type: "input" | "output"
  dataType: string
  label: string
}

interface PinRef {
  nodeId: string
  pinId: string
}

interface Connection {
  id: string
  from: PinRef // must be an output pin
  to: PinRef // must be an input pin
}

interface Node {
  id: string
  type: "start" | "database" | "filter" | "response" | "process"
  label: string
  x: number
  y: number
  config?: Record<string, any>
  pins: Pin[]
}

interface NodeCanvasProps {
  endpointId: string
}

/**
 * ==============================
 * Demo Graphs
 * ==============================
 */
const DEFAULT_NODES_USERS: Node[] = [
  {
    id: "1",
    type: "start",
    label: "リクエスト",
    x: 50,
    y: 150,
    config: { method: "GET", params: ["userId"] },
    pins: [{ id: "1-out-1", nodeId: "1", type: "output", dataType: "string", label: "userId" }],
  },
  {
    id: "2",
    type: "database",
    label: "ユーザー取得",
    x: 400,
    y: 150,
    config: { database: "main", table: "users", columns: ["id", "name", "score"] },
    pins: [
      { id: "2-in-1", nodeId: "2", type: "input", dataType: "string", label: "id" },
      { id: "2-out-1", nodeId: "2", type: "output", dataType: "string", label: "id" },
      { id: "2-out-2", nodeId: "2", type: "output", dataType: "string", label: "name" },
      { id: "2-out-3", nodeId: "2", type: "output", dataType: "number", label: "score" },
    ],
  },
  {
    id: "3",
    type: "process",
    label: "ランダム値生成",
    x: 750,
    y: 50,
    config: { script: "return Math.floor(Math.random() * 100) + 1;" },
    pins: [{ id: "3-out-1", nodeId: "3", type: "output", dataType: "number", label: "randomValue" }],
  },
  {
    id: "4",
    type: "process",
    label: "条件分岐(≤50)",
    x: 1100,
    y: 50,
    config: { script: "return input <= 50;" },
    pins: [
      { id: "4-in-1", nodeId: "4", type: "input", dataType: "number", label: "value" },
      { id: "4-out-1", nodeId: "4", type: "output", dataType: "boolean", label: "true(A処理)" },
      { id: "4-out-2", nodeId: "4", type: "output", dataType: "boolean", label: "false(B処理)" },
    ],
  },
  {
    id: "5",
    type: "response",
    label: "レスポンスA",
    x: 1450,
    y: 0,
    config: { selectedFields: [] },
    pins: [{ id: "5-in-1", nodeId: "5", type: "input", dataType: "any", label: "data" }],
  },
  {
    id: "6",
    type: "response",
    label: "レスポンスB",
    x: 1450,
    y: 250,
    config: { selectedFields: [] },
    pins: [{ id: "6-in-1", nodeId: "6", type: "input", dataType: "any", label: "data" }],
  },
]

const DEFAULT_CONNECTIONS_USERS: Connection[] = [
  { id: "c1", from: { nodeId: "1", pinId: "1-out-1" }, to: { nodeId: "2", pinId: "2-in-1" } },
  { id: "c2", from: { nodeId: "3", pinId: "3-out-1" }, to: { nodeId: "4", pinId: "4-in-1" } },
  { id: "c3", from: { nodeId: "4", pinId: "4-out-1" }, to: { nodeId: "5", pinId: "5-in-1" } },
  { id: "c4", from: { nodeId: "4", pinId: "4-out-2" }, to: { nodeId: "6", pinId: "6-in-1" } },
]

const USER_ITEMS_NODES: Node[] = [
  {
    id: "1",
    type: "start",
    label: "リクエスト",
    x: 50,
    y: 150,
    config: { method: "GET", params: ["userId"] },
    pins: [{ id: "1-out-1", nodeId: "1", type: "output", dataType: "string", label: "userId" }],
  },
  {
    id: "2",
    type: "database",
    label: "所持アイテム取得",
    x: 400,
    y: 150,
    config: { database: "main", table: "u_items", columns: ["item_id", "count"] },
    pins: [
      { id: "2-in-1", nodeId: "2", type: "input", dataType: "string", label: "user_id" },
      { id: "2-out-1", nodeId: "2", type: "output", dataType: "string", label: "item_id" },
      { id: "2-out-2", nodeId: "2", type: "output", dataType: "integer", label: "count" },
    ],
  },
  {
    id: "3",
    type: "database",
    label: "アイテム詳細",
    x: 750,
    y: 150,
    config: { database: "main", table: "m_items", columns: ["name", "rarity"] },
    pins: [
      { id: "3-in-1", nodeId: "3", type: "input", dataType: "string", label: "id" },
      { id: "3-out-1", nodeId: "3", type: "output", dataType: "string", label: "name" },
      { id: "3-out-2", nodeId: "3", type: "output", dataType: "integer", label: "rarity" },
    ],
  },
  {
    id: "4",
    type: "response",
    label: "アイテム一覧",
    x: 1100,
    y: 150,
    config: { selectedFields: [] },
    pins: [{ id: "4-in-1", nodeId: "4", type: "input", dataType: "any", label: "items" }],
  },
]

const USER_ITEMS_CONNECTIONS: Connection[] = [
  { id: "c1", from: { nodeId: "1", pinId: "1-out-1" }, to: { nodeId: "2", pinId: "2-in-1" } },
  { id: "c2", from: { nodeId: "2", pinId: "2-out-1" }, to: { nodeId: "3", pinId: "3-in-1" } },
  { id: "c3", from: { nodeId: "3", pinId: "3-out-1" }, to: { nodeId: "4", pinId: "4-in-1" } },
]

/**
 * ==============================
 * Component
 * ==============================
 */
export function NodeCanvas({ endpointId }: NodeCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    if (endpointId === "3") {
      setNodes(USER_ITEMS_NODES)
      setConnections(USER_ITEMS_CONNECTIONS)
    } else {
      setNodes(DEFAULT_NODES_USERS)
      setConnections(DEFAULT_CONNECTIONS_USERS)
    }
  }, [endpointId])

  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const [draggingConnection, setDraggingConnection] = useState<{
    from: PinRef
    x: number
    y: number
  } | null>(null)

  const [draggingNode, setDraggingNode] = useState<{
    nodeId: string
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)

  // Pan state
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number; scrollX: number; scrollY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const nodeIcons = {
    start: ArrowRight,
    database: Database,
    filter: Filter,
    response: Send,
    process: Code,
  }

  /**
   * Helpers
   */
  const getAllPins = (): Pin[] => nodes.flatMap((n) => n.pins)

  const getPin = (ref: PinRef): Pin | undefined =>
    nodes.find((n) => n.id === ref.nodeId)?.pins.find((p) => p.id === ref.pinId)

  const getPinPosition = (ref: PinRef) => {
    const pin = getPin(ref)
    if (!pin) return { x: 0, y: 0 }
    const node = nodes.find((n) => n.id === ref.nodeId)
    if (!node) return { x: 0, y: 0 }

    const pinIndex = node.pins.findIndex((p) => p.id === ref.pinId)

    // DOM構造に基づいた正確な位置計算:
    // ヘッダー部分: p-3 (上下24px) + アイコン領域 (32px) + border-b (1px) = 57px
    // ピンコンテナ: p-2 (上部8px)
    // 最初のピンまで: 57px + 8px = 65px
    // 各ピンの高さ: ピンハンドル (16px) + space-y-1 (4px) = 20px
    // ピンハンドルの中心: 8px (16px / 2)
    const firstPinCenter = 65 + 8 // 73px
    const pinHeight = 20
    const pinY = firstPinCenter + pinIndex * pinHeight

    // Card width 280px:
    // ピンハンドルは w-4 h-4 (16x16px)
    // ピンコンテナのpadding p-2 (8px) を考慮
    // input handle: 左端から 8px (padding) + 8px (ハンドル中心) = 16px
    // output handle: 右端から 280px - 8px (padding) - 8px (ハンドル中心) = 264px
    const pinX = pin.type === "input" ? 16 : 264

    return {
      x: node.x + pinX,
      y: node.y + (isInvalidEndNode(node) ? 24 : 0) + pinY,
    }
  }

  const canConnect = (from: PinRef, to: PinRef): { ok: boolean; reason?: string } => {
    const fromPin = getPin(from)
    const toPin = getPin(to)
    if (!fromPin || !toPin) return { ok: false, reason: "ピンが見つかりません" }
    if (from.nodeId === to.nodeId) return { ok: false, reason: "同一ノード間は接続不可" }
    if (fromPin.type !== "output") return { ok: false, reason: "出力ピンから開始してください" }
    if (toPin.type !== "input") return { ok: false, reason: "入力ピンへ接続してください" }

    // one-to-one for input pins
    const already = connections.some((c) => c.to.pinId === to.pinId && c.to.nodeId === to.nodeId)
    if (already) return { ok: false, reason: "入力ピンには1本まで" }

    // simple datatype check ("any" is wildcard)
    const compatible =
      fromPin.dataType === "any" || toPin.dataType === "any" || fromPin.dataType === toPin.dataType
    if (!compatible) return { ok: false, reason: `${fromPin.dataType} → ${toPin.dataType} は非互換` }

    return { ok: true }
  }

  const isInvalidEndNode = (node: Node) => {
    const cannotBeEnd = node.type === "database" || node.type === "filter" || node.type === "process"
    const hasOutput = connections.some((conn) => conn.from.nodeId === node.id)
    return cannotBeEnd && !hasOutput
  }

  const getNodeColor = (node: Node) => {
    const isStartNode = node.type === "start"
    const isEndNode = node.type === "response"
    const cannotBeEnd = node.type === "database" || node.type === "filter" || node.type === "process"
    const hasOutput = connections.some((conn) => conn.from.nodeId === node.id)

    if (cannotBeEnd && !hasOutput) return "border-red-500 bg-red-500/10"
    if (isStartNode || isEndNode) return "border-blue-500 bg-blue-500/10"
    if (node.type === "database") return "border-yellow-500 bg-yellow-500/10"
    if (node.type === "process") return "border-green-500 bg-green-500/10"
    return "border-border bg-card"
  }

  const getAvailableOutputPins = () => {
    const out: Array<{ nodeId: string; nodeLabel: string; pin: Pin }> = []
    nodes.forEach((n) => {
      if (n.type !== "response")
        n.pins
          .filter((p) => p.type === "output")
          .forEach((p) => out.push({ nodeId: n.id, nodeLabel: n.label, pin: p }))
    })
    return out
  }

  /**
   * Actions
   */
  const addNode = (type: Node["type"]) => {
    const labels = {
      start: "リクエスト",
      database: "データベースクエリ",
      filter: "データ変換",
      response: "レスポンス",
      process: "処理",
    } as const

    const ts = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const defaultPins: Record<string, Omit<Pin, "nodeId">[]> = {
      start: [{ id: `${ts()}-out-1`, type: "output", dataType: "string", label: "param1" }],
      database: [
        { id: `${ts()}-in-1`, type: "input", dataType: "string", label: "条件" },
        { id: `${ts()}-out-1`, type: "output", dataType: "string", label: "結果" },
      ],
      filter: [
        { id: `${ts()}-in-1`, type: "input", dataType: "any", label: "入力" },
        { id: `${ts()}-out-1`, type: "output", dataType: "any", label: "出力" },
      ],
      response: [{ id: `${ts()}-in-1`, type: "input", dataType: "any", label: "data" }],
      process: [
        { id: `${ts()}-in-1`, type: "input", dataType: "any", label: "入力" },
        { id: `${ts()}-out-1`, type: "output", dataType: "any", label: "出力" },
      ],
    }

    const defaultConfigs: Record<string, any> = {
      start: { method: "GET", params: ["param1"] },
      database: { database: "", table: "", columns: [] },
      filter: { script: "" },
      response: { selectedFields: [] },
      process: { script: "" },
    }

    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const pins = defaultPins[type].map((p) => ({ ...p, nodeId: newId }))

    let x = 50 + (canvasRef.current?.scrollLeft || 0)
    let y = 150 + (canvasRef.current?.scrollTop || 0)

    if (selectedNode) {
      const sel = nodes.find((n) => n.id === selectedNode)
      if (sel) {
        x = sel.x + 350
        y = sel.y
      }
    } else {
      const maxX = Math.max(...nodes.map((n) => n.x), 0)
      if (maxX > 0) x = maxX + 350
    }

    const newNode: Node = { id: newId, type, label: labels[type], x, y, config: defaultConfigs[type], pins }
    setNodes((prev) => [...prev, newNode])
    setSelectedNode(newId)
  }

  const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n)))
  }

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId))
    setConnections((prev) => prev.filter((c) => c.from.nodeId !== nodeId && c.to.nodeId !== nodeId))
    if (selectedNode === nodeId) setSelectedNode(null)
  }

  const deleteConnection = (connectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConnections((prev) => prev.filter((c) => c.id !== connectionId))
  }

  /**
   * Mouse Handlers
   */
  const handlePinMouseDown = (ref: PinRef, e: React.MouseEvent) => {
    e.stopPropagation()
    const pin = getPin(ref)
    if (pin?.type === "output") {
      const pos = getPinPosition(ref)
      setDraggingConnection({ from: ref, x: pos.x, y: pos.y })
    }
  }

  const handlePinMouseUp = (ref: PinRef, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!draggingConnection) return

    const validation = canConnect(draggingConnection.from, ref)
    if (validation.ok) {
      setConnections((prev) => [
        ...prev.filter((c) => !(c.to.nodeId === ref.nodeId && c.to.pinId === ref.pinId)), // one-to-one on input
        { id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, from: draggingConnection.from, to: ref },
      ])
    }
    setDraggingConnection(null)
  }

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if ((e.target as HTMLElement).closest(".pin-handle")) return
    const node = nodes.find((n) => n.id === nodeId)
    if (!node || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const scrollLeft = canvasRef.current.scrollLeft
    const scrollTop = canvasRef.current.scrollTop

    setDraggingNode({
      nodeId,
      startX: node.x,
      startY: node.y,
      offsetX: e.clientX - rect.left + scrollLeft - node.x,
      offsetY: e.clientY - rect.top + scrollTop - node.y,
    })
    setSelectedNode(nodeId)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    setIsPanning(true)
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollX: canvasRef.current.scrollLeft,
      scrollY: canvasRef.current.scrollTop,
    })
    setSelectedNode(null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scrollLeft = canvasRef.current.scrollLeft
    const scrollTop = canvasRef.current.scrollTop

    if (isPanning && panStart) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      canvasRef.current.scrollLeft = panStart.scrollX - dx
      canvasRef.current.scrollTop = panStart.scrollY - dy
      return
    }

    if (draggingNode) {
      const newX = e.clientX - rect.left + scrollLeft - draggingNode.offsetX
      const newY = e.clientY - rect.top + scrollTop - draggingNode.offsetY
      setNodes((prev) => prev.map((n) => (n.id === draggingNode.nodeId ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) } : n)))
    }

    if (draggingConnection) {
      setDraggingConnection({ ...draggingConnection, x: e.clientX - rect.left + scrollLeft, y: e.clientY - rect.top + scrollTop })
    }
  }

  const handleCanvasMouseUp = () => {
    setDraggingConnection(null)
    setDraggingNode(null)
    setIsPanning(false)
    setPanStart(null)
  }

  /**
   * Render
   */
  const currentNode = nodes.find((n) => n.id === selectedNode)

  return (
    <div className="relative h-full bg-background flex select-none">
      <div
        ref={canvasRef}
        className={`flex-1 relative overflow-auto ${isPanning ? "cursor-grabbing" : "cursor-default"}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* Top-right controls */}
        <div className="absolute top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                ノードを追加
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => addNode("start")}>
                <ArrowRight className="w-4 h-4 mr-2" />リクエスト
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("database")}>
                <Database className="w-4 h-4 mr-2" />データベースクエリ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("process")}>
                <Code className="w-4 h-4 mr-2" />処理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("filter")}>
                <Filter className="w-4 h-4 mr-2" />データ変換
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("response")}>
                <Send className="w-4 h-4 mr-2" />レスポンス
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative p-8 min-w-[2400px] min-h-[1600px]">
          {/* Connections layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="currentColor" className="text-primary" />
              </marker>
            </defs>

            {connections.map((c) => {
              // skip rendering if either endpoint pin disappeared
              const _fromPin = getPin(c.from)
              const _toPin = getPin(c.to)
              if (!_fromPin || !_toPin) return null
              const fromPos = getPinPosition(c.from)
              const toPos = getPinPosition(c.to)
              const midX = (fromPos.x + toPos.x) / 2
              const midY = (fromPos.y + toPos.y) / 2

              const c1x = fromPos.x + 50
              const c1y = fromPos.y
              const c2x = toPos.x - 50
              const c2y = toPos.y

              return (
                <g key={c.id}>
                  <path
                    d={`M ${fromPos.x} ${fromPos.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${toPos.x} ${toPos.y}`}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-primary"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* delete pill */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r="12"
                    fill="hsl(var(--destructive))"
                    className="cursor-pointer pointer-events-auto hover:opacity-80"
                    onClick={(e) => deleteConnection(c.id, e)}
                  />
                  <line x1={midX - 6} y1={midY} x2={midX + 6} y2={midY} stroke="white" strokeWidth="2" className="pointer-events-none" />
                </g>
              )
            })}

            {draggingConnection && (
              <path
                d={`M ${getPinPosition(draggingConnection.from).x} ${getPinPosition(draggingConnection.from).y} C ${getPinPosition(draggingConnection.from).x + 50} ${getPinPosition(draggingConnection.from).y}, ${draggingConnection.x - 50} ${draggingConnection.y}, ${draggingConnection.x} ${draggingConnection.y}`}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary opacity-50"
                strokeDasharray="5,5"
              />)
            }
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = nodeIcons[node.type]
            const invalidEnd = isInvalidEndNode(node)

            return (
              <Card
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNode(node.id)
                }}
                className={`absolute w-[280px] p-0 cursor-move transition-all hover:shadow-lg ${getNodeColor(node)} ${selectedNode === node.id ? "ring-2 ring-primary shadow-lg" : ""}`}
                style={{ left: node.x, top: node.y, zIndex: 2 }}
              >
                {invalidEnd && (
                  <div className="bg-red-500 text-white text-xs px-3 py-1 text-center font-medium">
                    ⚠️ このノードは終端になれません
                  </div>
                )}

                <div className="p-3 border-b border-border/50 flex items-center gap-2 bg-background/50">
                  <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{node.label}</div>
                    {node.config?.table && (
                      <div className="text-xs text-muted-foreground">Table: {node.config.table}</div>
                    )}
                    {node.config?.method && (
                      <div className="text-xs text-muted-foreground">Method: {node.config.method}</div>
                    )}
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  {node.pins.map((pin) => {
                    const ref: PinRef = { nodeId: node.id, pinId: pin.id }
                    return (
                      <div key={pin.id} className="flex items-center gap-2 group relative">
                        {pin.type === "input" && (
                          <div
                            className="pin-handle w-4 h-4 rounded-full border-2 border-primary bg-background cursor-pointer hover:bg-primary hover:scale-110 transition-all flex-shrink-0"
                            onMouseDown={(e) => handlePinMouseDown(ref, e)}
                            onMouseUp={(e) => handlePinMouseUp(ref, e)}
                            title={`${pin.label} (${pin.dataType})`}
                          />
                        )}
                        <span className={`text-xs flex-1 ${pin.type === "input" ? "text-left" : "text-right"}`}>
                          {pin.label}
                        </span>
                        {pin.type === "output" && (
                          <div
                            className="pin-handle w-4 h-4 rounded-full border-2 border-primary bg-background cursor-pointer hover:bg-primary hover:scale-110 transition-all flex-shrink-0"
                            onMouseDown={(e) => handlePinMouseDown(ref, e)}
                            title={`${pin.label} (${pin.dataType})`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {currentNode && (
        <NodeEditorPanel
          node={currentNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={(config) => updateNodeConfig(currentNode.id, config)}
          onDelete={() => deleteNode(currentNode.id)}
          availableOutputPins={getAvailableOutputPins()}
          allNodes={nodes}
        />
      )}

      {/* footer hint */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground flex items-center gap-2">
        <Unplug className="w-3 h-3" />
        <span>ピン（●）からドラッグして別ノードのピン（●）にドロップすると接続できます。入力ピンは1本まで／型は簡易チェック（anyはワイルドカード）。</span>
      </div>
    </div>
  )
}
