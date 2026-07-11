import { lazy, Suspense, useCallback, useMemo, useState } from "react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Icon, IconNames, Box, Stack } from "./components/ui"
import { DockLayout, useDock } from "@sino-purchase/layout-dock"
import { SheetsProvider, useAuth } from "@sino-purchase/sheets-react"
import { useTheme } from "./theme/ThemeContext"
import { buildMuiTheme } from "./theme/theme"
import { CLIENT_ID, SPREADSHEET_ID } from "./config/sheets"
import { usePlanStore } from "./app/stores/planStore"
import AccountingSettings from "./modules/accounting/AccountingSettings"
import { PlanSettingsPanel } from "./modules/plan/components/PlanSettingsPanel"
import { SyncIndicator } from "./components/SyncIndicator"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { LoginGate } from "./components/LoginGate"

const PlanManagement = lazy(() => import("./pages/PlanManagement"))
const MaterialInfo = lazy(() => import("./pages/MaterialInfo"))
const Accounting = lazy(() => import("./pages/Accounting"))
const Payments = lazy(() => import("./pages/Payments"))
const SheetsEditor = lazy(() => import("./pages/SheetsEditor"))

const fallback = <Box className="dv-panel" style={{ color: "var(--text-dim)" }}>Loading…</Box>

/** 主题与全局样式已下沉到 src/theme/theme.ts（buildMuiTheme）：设计令牌、全局 reset、
 *  滚动条/focus、CSS 变量注入均在那里统一处理，这里只负责按模式取用。 */

/* ── Navigation panels ── */

function PlanNavPanel() {
  const { openEditor } = useDock()
  return (
    <Box className="dv-panel">
      <Box className="dv-panel-item" onClick={() => openEditor("plan")}>
        <Icon icon={IconNames.SHOPPING_CART} size={14} />
        <span>采购清单</span>
      </Box>
    </Box>
  )
}

function MaterialNavPanel() {
  return (
    <Box className="dv-panel">
      <Box className="dv-panel-item" style={{ opacity: 0.5, cursor: "default" }}>
        <Icon icon={IconNames.LAYERS} size={14} />
        <span>导航目录（开发中）</span>
      </Box>
    </Box>
  )
}

function AccountingNavPanel() {
  const { openEditor } = useDock()
  return (
    <Box className="dv-panel">
      <Box className="dv-panel-item" onClick={() => openEditor("accounting")}>
        <Icon icon={IconNames.DOLLAR} size={14} />
        <span>现金日记账</span>
      </Box>
    </Box>
  )
}

function PaymentsNavPanel() {
  return (
    <Box className="dv-panel">
      <Box className="dv-panel-item" style={{ opacity: 0.5, cursor: "default" }}>
        <Icon icon={IconNames.EXCHANGE} size={14} />
        <span>导航目录（开发中）</span>
      </Box>
    </Box>
  )
}

function SettingsNavPanel() {
  const { openEditor } = useDock()
  const { theme, toggle } = useTheme()
  return (
    <Box className="dv-panel">
      <SyncIndicator />
      <Box className="dv-panel-item" onClick={() => openEditor("sheets-editor")}>
        <Icon icon={IconNames.GRID_VIEW} size={14} />
        <span>Google Sheets 数据编辑</span>
      </Box>
      <Box className="dv-panel-item" onClick={toggle} style={{ cursor: "pointer" }}>
        <Icon icon={IconNames.THEME} size={14} />
        <span>切换为{theme === "dark" ? "亮色" : "暗色"}主题</span>
      </Box>
    </Box>
  )
}

function LoginNavPanel() {
  const { loggedIn, user, login, logout } = useAuth()

  if (!loggedIn) {
    return (
      <Box className="dv-panel">
        <Box className="dv-panel-item" onClick={() => login()}>
          <Icon icon={IconNames.LOG_IN} size={14} />
          <span>登录 Google</span>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="dv-panel">
      <Box className="dv-panel-item" style={{ cursor: "default" }}>
        <Icon icon={IconNames.PERSON} size={14} />
        <span>{user?.name ?? user?.email ?? "已登录"}</span>
      </Box>
        <Box className="dv-panel-item" onClick={() => logout()}>
          <Icon icon={IconNames.LOG_OUT} size={14} />
          <span>退出登录</span>
        </Box>
    </Box>
  )
}

/* ── 右侧占位面板（轻量说明，无独立状态） ── */

function PlanBatchPanel() {
  // 选中任务的操作按钮 + 批量编辑表单由 PlanManagement 通过 Portal 挂载到下方 slot，
  // 以复用其唯一的 useSheetData 数据实例（P0-1：数据所有权唯一归属）。
  // 布局与其他右侧面板统一：Stack spacing=1 / p=1.5（=8px 间距 / 12px 内边距）。
  const selectedCount = usePlanStore(s => s.selectedIds.length)
  return (
    <Stack spacing={1} sx={{ height: "100%", overflow: "auto", p: 1.5 }}>
      <Box sx={{ fontSize: 13, fontWeight: 600 }}>批量操作</Box>
      {selectedCount === 0 && (
        <Box sx={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
          已选择 0 条任务。在左侧勾选任务后，可在此进行复制、批量编辑或删除。
        </Box>
      )}
      <div id="plan-batch-actions-slot" />
    </Stack>
  )
}

function MaterialRightPanel() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: "8px", padding: 12, overflow: "auto", height: "100%" }}>
      <Box style={{ fontSize: 13, fontWeight: 600 }}>物料筛选</Box>
      <Box style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
        物料信息模块开发中。此面板预留给分类筛选、价格区间与供应商维度统计。
      </Box>
    </Box>
  )
}

function PaymentsRightPanel() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: "8px", padding: 12, overflow: "auto", height: "100%" }}>
      <Box style={{ fontSize: 13, fontWeight: 600 }}>付款统计</Box>
      <Box style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
        往来付款模块开发中。此面板预留给按供应商/状态的金额汇总与账期提醒。
      </Box>
    </Box>
  )
}

function SheetsRightPanel() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: "8px", padding: 12, overflow: "auto", height: "100%" }}>
      <Box style={{ fontSize: 13, fontWeight: 600 }}>表格说明</Box>
      <Box style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
        此处嵌入的是与你 Google 账号绑定的表格。暗色模式下会自动反色以适配。修改会实时同步到云端。
      </Box>
    </Box>
  )
}

/* ── App ── */

function PlanAwareApp() {
  const { theme } = useTheme()
  // 右侧面板（打印设置等）默认常驻显示，用户可手动关闭
  const [rightVisible, setRightVisible] = useState(true)

  const handleRightVisibleChange = useCallback(
    (v: boolean) => setRightVisible(v),
    [],
  )

  return (
    <DockLayout
      theme={theme}
      navigation={[
        { id: "plan", icon: <Icon icon={IconNames.PROPERTIES} size={20} />, label: "计划管理", content: <PlanNavPanel /> },
        { id: "material", icon: <Icon icon={IconNames.LAYERS} size={20} />, label: "物料信息", content: <MaterialNavPanel /> },
        { id: "accounting", icon: <Icon icon={IconNames.DOLLAR} size={20} />, label: "记账报销", content: <AccountingNavPanel /> },
        { id: "payments", icon: <Icon icon={IconNames.EXCHANGE} size={20} />, label: "往来付款", content: <PaymentsNavPanel /> },
        { id: "settings", icon: <Icon icon={IconNames.COG} size={20} />, label: "设置", content: <SettingsNavPanel /> },
        { id: "login", icon: <Icon icon={IconNames.PERSON} size={20} />, label: "登录", content: <LoginNavPanel /> },
      ]}
      editors={[
        {
          id: "plan",
          label: "计划管理",
          content: <ErrorBoundary label="计划管理"><Suspense fallback={fallback}><PlanManagement /></Suspense></ErrorBoundary>,
          rightPanels: [
            { id: "plan-batch", label: "批量操作", content: <PlanBatchPanel /> },
            { id: "plan-settings", label: "计划设置", content: <PlanSettingsPanel /> },
          ],
        },
        {
          id: "material",
          label: "物料信息",
          content: <ErrorBoundary label="物料信息"><Suspense fallback={fallback}><MaterialInfo /></Suspense></ErrorBoundary>,
          rightPanels: [
            { id: "material-filter", label: "物料筛选", content: <MaterialRightPanel /> },
          ],
        },
        {
          id: "accounting",
          label: "记账报销",
          content: <ErrorBoundary label="记账报销"><Suspense fallback={fallback}><Accounting /></Suspense></ErrorBoundary>,
          rightPanels: [
            { id: "print-settings", label: "打印设置", content: <AccountingSettings /> },
          ],
        },
        {
          id: "payments",
          label: "往来付款",
          content: <ErrorBoundary label="往来付款"><Suspense fallback={fallback}><Payments /></Suspense></ErrorBoundary>,
          rightPanels: [
            { id: "payments-stats", label: "付款统计", content: <PaymentsRightPanel /> },
          ],
        },
        {
          id: "sheets-editor",
          label: "Google Sheets",
          content: <ErrorBoundary label="Google Sheets"><Suspense fallback={fallback}><SheetsEditor /></Suspense></ErrorBoundary>,
          rightPanels: [
            { id: "sheets-help", label: "表格说明", content: <SheetsRightPanel /> },
          ],
        },
      ]}
      right={{ size: 280, minSize: 200 }}
      rightVisible={rightVisible}
      onRightVisibleChange={handleRightVisibleChange}
      persistenceKey="sino-dock-state"
    />
  )
}

function App() {
  const { theme } = useTheme()
  const muiTheme = useMemo(() => buildMuiTheme(theme), [theme])

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <SheetsProvider clientId={CLIENT_ID} spreadsheetId={SPREADSHEET_ID}>
        <LoginGate>
          <PlanAwareApp />
        </LoginGate>
      </SheetsProvider>
    </MuiThemeProvider>
  )
}

export default App
