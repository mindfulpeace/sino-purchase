import { Button, Icon, IconNames, Box, Stack } from "../../components/ui"
import { useAuth } from "@sino-purchase/sheets-react"
import { useDock } from "@sino-purchase/layout-dock"

interface SheetsViewerProps {
  spreadsheetId: string
}

export default function SheetsViewer({ spreadsheetId }: SheetsViewerProps) {
  const { ready, loggedIn, login } = useAuth()
  const { theme } = useDock()

  if (!ready) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ height: "100%", color: "var(--text-dim)", fontSize: 14 }}>
        加载 Google 认证...
      </Stack>
    )
  }

  if (!loggedIn) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ height: "100%", flexDirection: "column", gap: 1.5, width: "100%" }}>
        <Box sx={{ fontSize: 14, color: "var(--text-dim)", textAlign: "center" }}>需要登录 Google 账号才能编辑数据表</Box>
        <Button intent="primary" icon={<Icon icon={IconNames.LOG_IN} />} onClick={login}>
          登录 Google
        </Button>
      </Stack>
    )
  }

  return (
    <Box sx={{ height: "100%" }}>
      <iframe
        src={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?embedded=true&single=true&rm=minimal`}
        style={{ width: "100%", height: "100%", border: "none", filter: theme === "dark" ? "invert(1) hue-rotate(180deg)" : undefined }}
        title="Google Sheets"
      />
    </Box>
  )
}