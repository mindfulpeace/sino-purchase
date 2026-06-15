import { useState } from "react"
import { Button } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { Icon } from "@blueprintjs/core"
import { useAuth } from "@sino-purchase/sheets-api"
import { useDock } from "@sino-purchase/ui-dock"
import { SPREADSHEET_ID } from "../config/sheets"

export default function SheetsEditor() {
  const { ready, loggedIn, login } = useAuth()
  const { theme } = useDock()
  const [sheetsKey, setSheetsKey] = useState(0)

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16, color: "var(--text-dim)" }}>
        <div style={{ fontSize: 18 }}>加载 Google 认证...</div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16, width: "100%" }}>
        <div style={{ fontSize: 18, color: "var(--text-dim)", textAlign: "center" }}>需要登录 Google 账号才能编辑数据表</div>
        <Button intent="primary" icon={<Icon icon={IconNames.LOG_IN} />} onClick={login}>
          登录 Google
        </Button>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Button small icon={<Icon icon={IconNames.REFRESH} />} onClick={() => setSheetsKey(k => k + 1)}>
          刷新
        </Button>
        <Button
          small
          icon={<Icon icon={IconNames.SHARE} />}
          onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`, "_blank")}
        >
          浏览器打开
        </Button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <iframe
          key={sheetsKey}
          src={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?embedded=true&single=true&rm=minimal`}
          style={{ width: "100%", height: "100%", border: "none", filter: theme === "dark" ? "invert(1) hue-rotate(180deg)" : undefined }}
          title="Google Sheets"
        />
      </div>
    </div>
  )
}
