import { lazy, Suspense } from "react"
import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { ThemeProvider, AppLayout } from "@sino-purchase/desk-ui"
import { SheetsProvider } from "@sino-purchase/sheets-api"
import { CLIENT_ID, SPREADSHEET_ID } from "./config/sheets"

const PlanManagement = lazy(() => import("./pages/PlanManagement"))
const MaterialInfo = lazy(() => import("./pages/MaterialInfo"))
const Accounting = lazy(() => import("./pages/Accounting"))
const Payments = lazy(() => import("./pages/Payments"))
const SheetsEditor = lazy(() => import("./pages/SheetsEditor"))

const activities = [
  { id: "plan", icon: <Icon icon={IconNames.PROPERTIES} size={22} />, label: "计划管理" },
  { id: "material", icon: <Icon icon={IconNames.LAYERS} size={22} />, label: "物料信息" },
  { id: "accounting", icon: <Icon icon={IconNames.DOLLAR} size={22} />, label: "记账报销" },
  { id: "payments", icon: <Icon icon={IconNames.EXCHANGE} size={22} />, label: "往来付款" },
  { id: "settings", icon: <Icon icon={IconNames.COG} size={22} />, label: "设置" },
]

const fallback = <div style={{ padding: 20, color: "var(--text-dim)" }}>Loading…</div>

const tabs = [
  { id: "plan", label: "计划管理", render: () => <Suspense fallback={fallback}><PlanManagement /></Suspense> },
  { id: "material", label: "物料信息", render: () => <Suspense fallback={fallback}><MaterialInfo /></Suspense> },
  { id: "accounting", label: "记账报销", render: () => <Suspense fallback={fallback}><Accounting /></Suspense> },
  { id: "payments", label: "往来付款", render: () => <Suspense fallback={fallback}><Payments /></Suspense> },
  { id: "sheets-editor", label: "Google Sheets", render: () => <Suspense fallback={fallback}><SheetsEditor /></Suspense> },
]

const sidePanels: Record<string, { id: string; label: string; render: (callbacks: { openTab: (id: string) => void }) => React.ReactNode }> = {
  plan: {
    id: "plan",
    label: "计划管理",
    render: () => (
      <div style={{ padding: 16, color: "var(--text-dim)", fontSize: 13 }}>
        导航目录（设计开发中）
      </div>
    ),
  },
  material: {
    id: "material",
    label: "物料信息",
    render: () => (
      <div style={{ padding: 16, color: "var(--text-dim)", fontSize: 13 }}>
        导航目录（设计开发中）
      </div>
    ),
  },
  accounting: {
    id: "accounting",
    label: "记账报销",
    render: () => (
      <div style={{ padding: 16, color: "var(--text-dim)", fontSize: 13 }}>
        导航目录（设计开发中）
      </div>
    ),
  },
  payments: {
    id: "payments",
    label: "往来付款",
    render: () => (
      <div style={{ padding: 16, color: "var(--text-dim)", fontSize: 13 }}>
        导航目录（设计开发中）
      </div>
    ),
  },
  settings: {
    id: "settings",
    label: "设置",
    render: ({ openTab }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 8 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 4, fontSize: 13 }}
          onClick={() => openTab("sheets-editor")}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Icon icon={IconNames.GRID_VIEW} size={16} />
          <span>Google Sheets 数据编辑</span>
        </div>
      </div>
    ),
  },
}

function App() {
  return (
    <SheetsProvider clientId={CLIENT_ID} spreadsheetId={SPREADSHEET_ID}>
      <ThemeProvider>
        <AppLayout
          title="sino-purchase-v2"
          activities={activities}
          sidePanels={sidePanels}
          tabs={tabs}
        />
      </ThemeProvider>
    </SheetsProvider>
  )
}

export default App
