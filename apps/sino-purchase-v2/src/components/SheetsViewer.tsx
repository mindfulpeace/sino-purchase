import { Button, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useAuth } from "@sino-purchase/sheets-api"
import { useTheme } from "@sino-purchase/desk-ui"

interface SheetsViewerProps {
  spreadsheetId: string
}

export default function SheetsViewer({ spreadsheetId }: SheetsViewerProps) {
  const { ready, loggedIn, login } = useAuth()
  const { theme } = useTheme()

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)", fontSize: 14 }}>
        加载 Google 认证...
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 14, color: "var(--text-dim)" }}>需要登录 Google 账号才能编辑数据表</div>
        <Button intent="primary" icon={<Icon icon={IconNames.LOG_IN} />} onClick={login}>
          登录 Google
        </Button>
      </div>
    )
  }

  return (
    <div style={{ height: "100%" }}>
      <iframe
        src={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?embedded=true&single=true&rm=minimal`}
        style={{ width: "100%", height: "100%", border: "none", filter: theme === "dark" ? "invert(1) hue-rotate(180deg)" : undefined }}
        title="Google Sheets"
      />
    </div>
  )
}
