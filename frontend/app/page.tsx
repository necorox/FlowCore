"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DatabaseEditor } from "@/components/database-editor"
import { ApiEditor } from "@/components/api-editor"
import { AuthEditor } from "@/components/auth-editor"

export default function Page() {
  const [activeTab, setActiveTab] = useState<"database" | "api" | "auth">("database")

  return (
    <div className="flex h-screen bg-background dark">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {activeTab === "database" && <DatabaseEditor />}
        {activeTab === "api" && <ApiEditor />}
        {activeTab === "auth" && <AuthEditor />}
      </main>
    </div>
  )
}
