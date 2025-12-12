"use client"

import { useState } from "react"
import { Plus, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NodeCanvas } from "@/components/node-canvas"

interface Endpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
}

export function ApiEditor() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: "1", name: "Get Users", method: "GET", path: "/api/users" },
    { id: "2", name: "Create User", method: "POST", path: "/api/users" },
    { id: "3", name: "Get User Items", method: "GET", path: "/api/user/items" },
  ])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>("1")

  const addEndpoint = () => {
    const newEndpoint: Endpoint = {
      id: Date.now().toString(),
      name: "New Endpoint",
      method: "GET",
      path: "/api/endpoint",
    }
    setEndpoints([...endpoints, newEndpoint])
    setSelectedEndpoint(newEndpoint.id)
  }

  const deleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter((e) => e.id !== id))
    if (selectedEndpoint === id) {
      setSelectedEndpoint(endpoints[0]?.id || null)
    }
  }

  const updateEndpointMethod = (method: "GET" | "POST" | "PUT" | "DELETE") => {
    if (!selectedEndpoint) return
    setEndpoints(endpoints.map((e) => (e.id === selectedEndpoint ? { ...e, method } : e)))
  }

  const updateEndpointPath = (path: string) => {
    if (!selectedEndpoint) return
    setEndpoints(endpoints.map((e) => (e.id === selectedEndpoint ? { ...e, path } : e)))
  }

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint)

  const methodColors = {
    GET: "bg-accent text-accent-foreground",
    POST: "bg-primary text-primary-foreground",
    PUT: "bg-chart-3 text-primary-foreground",
    DELETE: "bg-destructive text-destructive-foreground",
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
            <button
              key={endpoint.id}
              onClick={() => setSelectedEndpoint(endpoint.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-colors ${selectedEndpoint === endpoint.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
                }`}
            >
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${methodColors[endpoint.method]}`}>
                {endpoint.method}
              </span>
              <span className="truncate">{endpoint.name}</span>
            </button>
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
                  className="flex-1"
                  placeholder="/api/endpoint"
                />
                <Button>
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
