import { useState } from "react"
import { Button, Icon, IconNames, Box, Stack } from "../components/ui"
import { useAuth } from "@sino-purchase/sheets-react"
import { useDock } from "@sino-purchase/layout-dock"
import { SPREADSHEET_ID } from "../config/sheets"

export default function SheetsEditor() {
  const { ready, loggedIn, login } = useAuth()
  const { theme } = useDock()
  const [sheetsKey, setSheetsKey] = useState(0)

  if (!ready) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ height: "100%", flexDirection: "column", gap: 2, color: "var(--text-dim)" }}>
        <Box sx={{ fontSize: 18 }}>加载 Google 认证...</Box>
      </Stack>
    )
  }

  if (!loggedIn) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ height: "100%", flexDirection: "column", gap: 2, width: "100%" }}>
        <Box sx={{ fontSize: 18, color: "var(--text-dim)", textAlign: "center" }}>需要登录 Google 账号才能编辑数据表</Box>
        <Button intent="primary" icon={<Icon icon={IconNames.LOG_IN} />} onClick={login}>
          登录 Google
        </Button>
      </Stack>
    )
  }

  return (
    <Stack sx={{ height: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: "6px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
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
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          key={sheetsKey}
          src={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?embedded=true&single=true&rm=minimal`}
          style={{ width: "100%", height: "100%", border: "none", filter: theme === "dark" ? "invert(1) hue-rotate(180deg)" : undefined }}
          title="Google Sheets"
        />
      </Box>
    </Stack>
  )
}
