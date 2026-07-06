import { lazy, Suspense, useCallback, useMemo } from "react"
import { ThemeProvider as MuiThemeProvider, createTheme, type Theme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Icon, IconNames } from "./components/ui"
import { DockLayout, useDock } from "@sino-purchase/layout-dock"
import { SheetsProvider, useAuth } from "@sino-purchase/sheets-react"
import { useTheme } from "./theme/ThemeContext"
import { CLIENT_ID, SPREADSHEET_ID } from "./config/sheets"
import { useDocSettingsStore } from "./app/stores/docSettingsStore"
import AccountingSettings from "./modules/accounting/AccountingSettings"

const PlanManagement = lazy(() => import("./pages/PlanManagement"))
const MaterialInfo = lazy(() => import("./pages/MaterialInfo"))
const Accounting = lazy(() => import("./pages/Accounting"))
const Payments = lazy(() => import("./pages/Payments"))
const SheetsEditor = lazy(() => import("./pages/SheetsEditor"))

const fallback = <div className="dv-panel" style={{ color: "var(--text-dim)" }}>Loading…</div>

/** Build an MUI theme per color mode. Non-MUI surfaces (inline styles, dialogs
 *  using var(--bg-surface), dockview chrome) follow the CSS-variable system in
 *  index.css, toggled by the html.theme-light class driven by ThemeProvider. */
function buildMuiTheme(mode: "dark" | "light"): Theme {
  const dark = mode === "dark"
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? "#4a90d9" : "#2f6fb3" },
      error: { main: dark ? "#cd4246" : "#c0322f" },
      success: { main: dark ? "#238551" : "#1f7a48" },
      warning: { main: dark ? "#d9822b" : "#b9701f" },
      text: {
        primary: dark ? "#e0e0e0" : "#1a1a2e",
        secondary: dark ? "#858585" : "#5a5a72",
      },
      background: {
        default: dark ? "#121224" : "#f4f5f7",
        paper: dark ? "#1e1e3e" : "#ffffff",
      },
      divider: dark ? "#3a3a5a" : "#d8dce3",
      action: { hover: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
    },
    typography: { fontSize: 12, fontFamily: "inherit" },
    shape: { borderRadius: 4 },
    components: {
      MuiButton: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            fontSize: 13,
            padding: "4px 12px",
            lineHeight: "20px",
          },
          sizeSmall: {
            fontSize: 12,
            padding: "2px 8px",
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            fontSize: 12,
            "& .MuiOutlinedInput-root": {
              fontSize: 12,
              fontFamily: "inherit",
              "& fieldset": { borderColor: "var(--border, #3a3a5a)" },
            },
            "& .MuiInputBase-input": { padding: "2px 8px", height: 20 },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: { fontSize: 12 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontSize: 12 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: "var(--bg-surface, #1e1e3e)",
            border: "1px solid var(--border, #3a3a5a)",
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            background: "var(--bg-surface, #1e1e3e)",
            border: "1px solid var(--border, #3a3a5a)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontSize: 11 },
          sizeSmall: { height: 18 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { fontSize: 12 },
        },
      },
    },
  })
}

/* ── Navigation panels ── */

function PlanNavPanel() {
  const { openEditor } = useDock()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => openEditor("plan")}>
        <Icon icon={IconNames.SHOPPING_CART} size={14} />
        <span>采购清单</span>
      </div>
    </div>
  )
}

function MaterialNavPanel() {
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" style={{ opacity: 0.5, cursor: "default" }}>
        <Icon icon={IconNames.LAYERS} size={14} />
        <span>导航目录（开发中）</span>
      </div>
    </div>
  )
}

function AccountingNavPanel() {
  const { openEditor } = useDock()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => openEditor("accounting")}>
        <Icon icon={IconNames.DOLLAR} size={14} />
        <span>现金日记账</span>
      </div>
    </div>
  )
}

function PaymentsNavPanel() {
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" style={{ opacity: 0.5, cursor: "default" }}>
        <Icon icon={IconNames.EXCHANGE} size={14} />
        <span>导航目录（开发中）</span>
      </div>
    </div>
  )
}

function SettingsNavPanel() {
  const { openEditor } = useDock()
  const { theme, toggle } = useTheme()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => openEditor("sheets-editor")}>
        <Icon icon={IconNames.GRID_VIEW} size={14} />
        <span>Google Sheets 数据编辑</span>
      </div>
      <div className="dv-panel-item" onClick={toggle} style={{ cursor: "pointer" }}>
        <Icon icon={IconNames.THEME} size={14} />
        <span>切换为{theme === "dark" ? "亮色" : "暗色"}主题</span>
      </div>
    </div>
  )
}

function LoginNavPanel() {
  const { loggedIn, user, login, logout } = useAuth()

  if (!loggedIn) {
    return (
      <div className="dv-panel">
        <div className="dv-panel-item" onClick={() => login()}>
          <Icon icon={IconNames.LOG_IN} size={14} />
          <span>登录 Google</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dv-panel">
      <div className="dv-panel-item" style={{ cursor: "default" }}>
        <Icon icon={IconNames.PERSON} size={14} />
        <span>{user?.name ?? user?.email ?? "已登录"}</span>
      </div>
      <div className="dv-panel-item" onClick={() => logout()}>
        <Icon icon={IconNames.LOG_OUT} size={14} />
        <span>退出登录</span>
      </div>
    </div>
  )
}

/* ── App ── */

function PlanAwareApp() {
  const { theme } = useTheme()
  const { propertiesVisible, setPropertiesVisible } = useDocSettingsStore()

  const handleRightVisibleChange = useCallback(
    (v: boolean) => setPropertiesVisible(v),
    [setPropertiesVisible],
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
        { id: "plan", label: "计划管理", content: <Suspense fallback={fallback}><PlanManagement /></Suspense> },
        { id: "material", label: "物料信息", content: <Suspense fallback={fallback}><MaterialInfo /></Suspense> },
        {
          id: "accounting",
          label: "记账报销",
          content: <Suspense fallback={fallback}><Accounting /></Suspense>,
          rightPanels: [
            { id: "print-settings", label: "打印设置", content: <AccountingSettings /> },
          ],
        },
        { id: "payments", label: "往来付款", content: <Suspense fallback={fallback}><Payments /></Suspense> },
        { id: "sheets-editor", label: "Google Sheets", content: <Suspense fallback={fallback}><SheetsEditor /></Suspense> },
      ]}
      right={{ size: 280, minSize: 200 }}
      rightVisible={propertiesVisible}
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
        <PlanAwareApp />
      </SheetsProvider>
    </MuiThemeProvider>
  )
}

export default App
