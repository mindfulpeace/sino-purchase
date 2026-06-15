import { lazy, Suspense } from "react"
import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { DockLayout, useDock } from "@sino-purchase/ui-dock"
import { SheetsProvider, useAuth } from "@sino-purchase/sheets-api"
import { CLIENT_ID, SPREADSHEET_ID } from "./config/sheets"

const PlanManagement = lazy(() => import("./pages/PlanManagement"))
const MaterialInfo = lazy(() => import("./pages/MaterialInfo"))
const Accounting = lazy(() => import("./pages/Accounting"))
const Payments = lazy(() => import("./pages/Payments"))
const SheetsEditor = lazy(() => import("./pages/SheetsEditor"))

const fallback = <div className="dv-panel" style={{ color: "var(--text-dim)" }}>Loading…</div>

/* ── Navigation panels ── */

function PlanNavPanel() {
  const { openEditor, setStatus } = useDock()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => { openEditor("plan"); setStatus("已打开 采购清单") }}>
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
  const { openEditor, setStatus } = useDock()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => { openEditor("accounting"); setStatus("已打开 现金日记账") }}>
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
  const { openEditor, setStatus } = useDock()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => { openEditor("sheets-editor"); setStatus("已打开 Google Sheets") }}>
        <Icon icon={IconNames.GRID_VIEW} size={14} />
        <span>Google Sheets 数据编辑</span>
      </div>
    </div>
  )
}

/* ── Header right buttons ── */

function HeaderRight() {
  const auth = useAuth()
  return (
    <button
      className="dv-titlebar-btn"
      title={auth.loggedIn ? "已登录" : "登录 Google"}
      onClick={auth.loggedIn ? auth.logout : auth.login}
    >
      <Icon icon={auth.loggedIn ? IconNames.USER : IconNames.LOG_IN} size={14} />
    </button>
  )
}

/* ── App ── */

function PlanAwareApp() {
  return (
    <DockLayout
      title="sino-purchase-v2"
      headerRight={<HeaderRight />}
      navigation={[
        { id: "plan", icon: <Icon icon={IconNames.PROPERTIES} size={20} />, label: "计划管理", content: <PlanNavPanel /> },
        { id: "material", icon: <Icon icon={IconNames.LAYERS} size={20} />, label: "物料信息", content: <MaterialNavPanel /> },
        { id: "accounting", icon: <Icon icon={IconNames.DOLLAR} size={20} />, label: "记账报销", content: <AccountingNavPanel /> },
        { id: "payments", icon: <Icon icon={IconNames.EXCHANGE} size={20} />, label: "往来付款", content: <PaymentsNavPanel /> },
        { id: "settings", icon: <Icon icon={IconNames.COG} size={20} />, label: "设置", content: <SettingsNavPanel /> },
      ]}
      editors={[
        { id: "plan", label: "计划管理", content: <Suspense fallback={fallback}><PlanManagement /></Suspense> },
        { id: "material", label: "物料信息", content: <Suspense fallback={fallback}><MaterialInfo /></Suspense> },
        { id: "accounting", label: "记账报销", content: <Suspense fallback={fallback}><Accounting /></Suspense> },
        { id: "payments", label: "往来付款", content: <Suspense fallback={fallback}><Payments /></Suspense> },
        { id: "sheets-editor", label: "Google Sheets", content: <Suspense fallback={fallback}><SheetsEditor /></Suspense> },
      ]}
      right={{ size: 280, minSize: 200, title: "属性" }}
      properties={
        <div className="dv-panel-wide">
          <h4>属性</h4>
          <div>选中内容后显示属性</div>
        </div>
      }
    />
  )
}

function App() {
  return (
    <SheetsProvider clientId={CLIENT_ID} spreadsheetId={SPREADSHEET_ID}>
      <PlanAwareApp />
    </SheetsProvider>
  )
}

export default App
