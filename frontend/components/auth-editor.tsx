"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Key, User, Settings } from "lucide-react"

export function AuthEditor() {
  const [authMethod, setAuthMethod] = useState<"email" | "oauth">("email")

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">認証設定</h2>
          <p className="text-muted-foreground">ユーザー認証システムの構成とセキュリティ設定</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card
            className={`p-6 cursor-pointer transition-all ${
              authMethod === "email" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
            }`}
            onClick={() => setAuthMethod("email")}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground mb-1">メール/パスワード認証</h3>
                <p className="text-sm text-muted-foreground">標準的なメールアドレスとパスワードによる認証</p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all ${
              authMethod === "oauth" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
            }`}
            onClick={() => setAuthMethod("oauth")}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground mb-1">OAuth認証</h3>
                <p className="text-sm text-muted-foreground">Google、GitHub等のソーシャルログイン</p>
              </div>
            </div>
          </Card>
        </div>

        {authMethod === "email" && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              メール認証設定
            </h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="min-password">最小パスワード長</Label>
                <Input id="min-password" type="number" defaultValue="8" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="require-special" defaultChecked />
                <Label htmlFor="require-special" className="cursor-pointer">
                  特殊文字を必須にする
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="require-number" defaultChecked />
                <Label htmlFor="require-number" className="cursor-pointer">
                  数字を必須にする
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="email-verification" defaultChecked />
                <Label htmlFor="email-verification" className="cursor-pointer">
                  メール確認を必須にする
                </Label>
              </div>
            </div>
          </Card>
        )}

        {authMethod === "oauth" && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              OAuthプロバイダー
            </h3>
            <div className="space-y-4">
              {["Google", "GitHub", "Facebook", "Twitter"].map((provider) => (
                <div key={provider} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted" />
                    <span className="font-medium">{provider}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    設定
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            ユーザーフィールド
          </h3>
          <div className="space-y-3">
            {["email", "username", "avatar_url", "created_at"].map((field) => (
              <div key={field} className="flex items-center justify-between p-3 border border-border rounded">
                <span className="font-mono text-sm">{field}</span>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              フィールドを追加
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
