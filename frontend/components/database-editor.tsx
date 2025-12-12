"use client"

import { useState } from "react"
import { Plus, Table2, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Column {
  id: string
  name: string
  type: string
  required: boolean
}

interface Table {
  id: string
  name: string
  columns: Column[]
}

export function DatabaseEditor() {
  const [tables, setTables] = useState<Table[]>([
    {
      id: "1",
      name: "users",
      columns: [
        { id: "1", name: "id", type: "uuid", required: true },
        { id: "2", name: "email", type: "text", required: true },
        { id: "3", name: "created_at", type: "timestamp", required: true },
      ],
    },
    {
      id: "2",
      name: "m_items",
      columns: [
        { id: "1", name: "id", type: "uuid", required: true },
        { id: "2", name: "name", type: "text", required: true },
        { id: "3", name: "type", type: "text", required: true },
        { id: "4", name: "rarity", type: "integer", required: true },
        { id: "5", name: "effect_value", type: "integer", required: true },
      ],
    },
    {
      id: "3",
      name: "u_items",
      columns: [
        { id: "1", name: "id", type: "uuid", required: true },
        { id: "2", name: "user_id", type: "uuid", required: true },
        { id: "3", name: "item_id", type: "uuid", required: true },
        { id: "4", name: "count", type: "integer", required: true },
        { id: "5", name: "obtained_at", type: "timestamp", required: true },
      ],
    },
  ])
  const [selectedTable, setSelectedTable] = useState<string | null>("1")
  const [csvData, setCsvData] = useState("")
  const [showCsvImport, setShowCsvImport] = useState(false)

  const addColumn = () => {
    if (!selectedTable) return
    setTables(
      tables.map((table) =>
        table.id === selectedTable
          ? {
              ...table,
              columns: [
                ...table.columns,
                {
                  id: Date.now().toString(),
                  name: "new_column",
                  type: "text",
                  required: false,
                },
              ],
            }
          : table,
      ),
    )
  }

  const deleteColumn = (columnId: string) => {
    if (!selectedTable) return
    setTables(
      tables.map((table) =>
        table.id === selectedTable
          ? {
              ...table,
              columns: table.columns.filter((col) => col.id !== columnId),
            }
          : table,
      ),
    )
  }

  const updateColumn = (columnId: string, field: keyof Column, value: string | boolean) => {
    if (!selectedTable) return
    setTables(
      tables.map((table) =>
        table.id === selectedTable
          ? {
              ...table,
              columns: table.columns.map((col) => (col.id === columnId ? { ...col, [field]: value } : col)),
            }
          : table,
      ),
    )
  }

  const addTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      name: `table_${tables.length + 1}`,
      columns: [{ id: Date.now().toString(), name: "id", type: "uuid", required: true }],
    }
    setTables([...tables, newTable])
    setSelectedTable(newTable.id)
  }

  const handleCsvImport = () => {
    if (!csvData.trim() || !selectedTable) return

    const lines = csvData.trim().split("\n")
    if (lines.length === 0) return

    const headers = lines[0].split(",").map((h) => h.trim())
    const rows = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim()))

    console.log(`[v0] Importing ${rows.length} rows with columns:`, headers)
    alert(`CSVデータをインポートしました: ${rows.length}行, カラム: ${headers.join(", ")}`)

    setCsvData("")
    setShowCsvImport(false)
  }

  const currentTable = tables.find((t) => t.id === selectedTable)

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-card-foreground">テーブル</h2>
          <Button size="sm" onClick={addTable} className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-2">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                selectedTable === table.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
              }`}
            >
              <Table2 className="w-4 h-4" />
              {table.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {currentTable ? (
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{currentTable.name}</h2>
                <p className="text-sm text-muted-foreground">{currentTable.columns.length} カラム</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowCsvImport(!showCsvImport)} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  CSVインポート
                </Button>
                <Button onClick={addColumn}>
                  <Plus className="w-4 h-4 mr-2" />
                  カラムを追加
                </Button>
              </div>
            </div>

            {showCsvImport && (
              <Card className="p-4 mb-6 bg-secondary/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">CSVデータ</Label>
                    <Button size="sm" variant="ghost" onClick={() => setShowCsvImport(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="例:&#10;id,name,email&#10;1,John Doe,john@example.com&#10;2,Jane Smith,jane@example.com"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    className="font-mono text-sm min-h-[150px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCsvImport} disabled={!csvData.trim()}>
                      <Upload className="w-4 h-4 mr-2" />
                      インポート実行
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
                  <div className="col-span-4">カラム名</div>
                  <div className="col-span-3">型</div>
                  <div className="col-span-2">必須</div>
                  <div className="col-span-3">アクション</div>
                </div>
                {currentTable.columns.map((column) => (
                  <div key={column.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <Input
                        value={column.name}
                        onChange={(e) => updateColumn(column.id, "name", e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="col-span-3">
                      <Select value={column.type} onValueChange={(value) => updateColumn(column.id, "type", value)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="integer">Integer</SelectItem>
                          <SelectItem value="uuid">UUID</SelectItem>
                          <SelectItem value="timestamp">Timestamp</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="checkbox"
                        checked={column.required}
                        onChange={(e) => updateColumn(column.id, "required", e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="col-span-3">
                      <Button variant="ghost" size="sm" onClick={() => deleteColumn(column.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Table2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">テーブルを選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
