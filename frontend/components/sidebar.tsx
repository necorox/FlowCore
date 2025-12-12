"use client"

import { Database, Zap, Lock, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: "database" | "api" | "auth"
  onTabChange: (tab: "database" | "api" | "auth") => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: "database" as const, icon: Database, label: "データベース" },
    { id: "api" as const, icon: Zap, label: "API" },
    { id: "auth" as const, icon: Lock, label: "認証" },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-lg">VisualAPI</h1>
            <p className="text-xs text-muted-foreground">バックエンドビルダー</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">プロジェクト: demo-app</p>
          <p>環境: Development</p>
        </div>
      </div>
    </aside>
  )
}
