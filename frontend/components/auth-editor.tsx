"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Key, User, Settings } from "lucide-react"
import { getAuthSettings, updateAuthSettings, getAuthFields } from "@/lib/api"
import type { AuthSettings, AuthField, AuthMethod } from "@/lib/types"

export function AuthEditor() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [authSettings, setAuthSettings] = useState<AuthSettings | null>(null)
  const [authFields, setAuthFields] = useState<AuthField[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // メール認証の設定値
  const [minPasswordLength, setMinPasswordLength] = useState(8)
  const [requireSpecialChar, setRequireSpecialChar] = useState(true)
  const [requireNumber, setRequireNumber] = useState(true)
  const [emailVerification, setEmailVerification] = useState(true)

  // 初期読み込み
  useEffect(() => {
    loadAuthSettings()
    loadAuthFields()
  }, [])

  const loadAuthSettings = async () => {
    setLoading(true)
    setError(null)
    const result = await getAuthSettings()

    if (result.success) {
      setAuthSettings(result.data)
      setAuthMethod(result.data.method)

      // 設定値を展開
      if (result.data.config) {
        setMinPasswordLength(result.data.config.min_password_length || 8)
        setRequireSpecialChar(result.data.config.require_special_char || false)
        setRequireNumber(result.data.config.require_number || false)
        setEmailVerification(result.data.config.email_verification || false)
      }
    } else {
      setError(result.error)
      console.error("Failed to load auth settings:", result.error)
    }
    setLoading(false)
  }

  const loadAuthFields = async () => {
    const result = await getAuthFields()

    if (result.success) {
      setAuthFields(result.data.fields)
    } else {
      console.error("Failed to load auth fields:", result.error)
    }
  }

  const handleSaveSettings = async () => {
    const config = authMethod === "email"
      ? {
          min_password_length: minPasswordLength,
          require_special_char: requireSpecialChar,
          require_number: requireNumber,
          email_verification: emailVerification,
        }
      : {} // OAuth用の設定は別途実装

    const result = await updateAuthSettings({
      method: authMethod,
      config,
    })

    if (result.success) {
      setAuthSettings(result.data)
      alert("認証設定を保存しました")
    } else {
      alert(`認証設定の保存に失敗しました: ${result.error}`)
    }
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
          <Button onClick={loadAuthSettings}>再読み込み</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">認証設定</h2>
            <p className="text-muted-foreground">ユーザー認証システムの構成とセキュリティ設定</p>
          </div>
          <Button onClick={handleSaveSettings}>設定を保存</Button>
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
                <Input
                  id="min-password"
                  type="number"
                  value={minPasswordLength}
                  onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="require-special"
                  checked={requireSpecialChar}
                  onChange={(e) => setRequireSpecialChar(e.target.checked)}
                />
                <Label htmlFor="require-special" className="cursor-pointer">
                  特殊文字を必須にする
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="require-number"
                  checked={requireNumber}
                  onChange={(e) => setRequireNumber(e.target.checked)}
                />
                <Label htmlFor="require-number" className="cursor-pointer">
                  数字を必須にする
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="email-verification"
                  checked={emailVerification}
                  onChange={(e) => setEmailVerification(e.target.checked)}
                />
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
            {authFields.length > 0 ? (
              authFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
                  <div>
                    <span className="font-mono text-sm">{field.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
                    {field.required && <span className="text-xs text-destructive ml-2">*必須</span>}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">フィールドがありません</p>
            )}
            <Button variant="outline" className="w-full bg-transparent">
              フィールドを追加
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
