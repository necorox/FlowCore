"use client"

import { useState, useEffect } from "react"
import { Plus, Table2, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getTables, createTable, updateTable, deleteTable as deleteTableApi, importCSV } from "@/lib/api"
import type { Table, Column, ColumnCreate } from "@/lib/types"

export function DatabaseEditor() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [csvData, setCsvData] = useState("")
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初期読み込み
  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setLoading(true)
    setError(null)
    const result = await getTables()

    if (result.success) {
      setTables(result.data.tables)
      if (result.data.tables.length > 0 && !selectedTable) {
        setSelectedTable(result.data.tables[0].id)
      }
    } else {
      setError(result.error)
      console.error("Failed to load tables:", result.error)
    }
    setLoading(false)
  }

  const addColumn = async () => {
    if (!selectedTable) return
    const currentTable = tables.find((t) => t.id === selectedTable)
    if (!currentTable) return

    // 新しいカラムをローカルに追加（即座に反映）
    const newColumn: ColumnCreate = {
      name: "new_column",
      type: "text",
      required: false,
    }

    // APIを呼び出してサーバーに反映
    const result = await updateTable(selectedTable, {
      columns: [newColumn],
    })

    if (result.success) {
      // 成功したらデータを再読み込み
      await loadTables()
      setSelectedTable(selectedTable) // 選択を維持
    } else {
      alert(`カラムの追加に失敗しました: ${result.error}`)
    }
  }

  const deleteColumn = (columnId: string) => {
    // カラム削除はバックエンド側で未実装のため、ローカルのみで削除
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
    alert("注意: カラム削除はローカルのみです。バックエンド側の実装が必要です。")
  }

  const updateColumn = (columnId: string, field: keyof Column, value: string | boolean) => {
    // カラム更新もローカルのみ
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

  const addTable = async () => {
    const tableName = prompt("テーブル名を入力してください:", `table_${tables.length + 1}`)
    if (!tableName) return

    const result = await createTable({
      name: tableName,
      columns: [
        {
          name: "id",
          type: "uuid",
          required: true,
        },
      ],
    })

    if (result.success) {
      await loadTables()
      setSelectedTable(result.data.id)
    } else {
      alert(`テーブルの作成に失敗しました: ${result.error}`)
    }
  }

  const handleDeleteTable = async () => {
    if (!selectedTable) return
    const currentTable = tables.find((t) => t.id === selectedTable)
    if (!currentTable) return

    if (!confirm(`テーブル "${currentTable.name}" を削除しますか？`)) return

    const result = await deleteTableApi(selectedTable)

    if (result.success) {
      await loadTables()
      setSelectedTable(null)
    } else {
      alert(`テーブルの削除に失敗しました: ${result.error}`)
    }
  }

  const handleCsvImport = async () => {
    if (!csvData.trim() || !selectedTable) return

    const result = await importCSV(selectedTable, {
      csv_data: csvData,
    })

    if (result.success) {
      alert("CSVデータをインポートしました")
      setCsvData("")
      setShowCsvImport(false)
    } else {
      alert(`CSVインポートに失敗しました: ${result.error}`)
    }
  }

  const currentTable = tables.find((t) => t.id === selectedTable)

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
          <Button onClick={loadTables}>再読み込み</Button>
        </div>
      </div>
    )
  }

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
                <Button onClick={handleDeleteTable} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  テーブル削除
                </Button>
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
