import { lazy, Suspense, useCallback } from "react"
import { Icon, IconNames } from "./components/ui"
import { DockLayout, useDock } from "@sino-purchase/layout-dock"
import { SheetsProvider, useAuth } from "@sino-purchase/sheets-react"
import { CLIENT_ID, SPREADSHEET_ID } from "./config/sheets"
import { useDocSettingsStore } from "./app/stores/docSettingsStore"
import AccountingSettings from "./modules/accounting/AccountingSettings"

const PlanManagement = lazy(() => import("./pages/PlanManagement"))
const MaterialInfo = lazy(() => import("./pages/MaterialInfo"))
const Accounting = lazy(() => import("./pages/Accounting"))
const Payments = lazy(() => import("./pages/Payments"))
const SheetsEditor = lazy(() => import("./pages/SheetsEditor"))

const fallback = <div className="dv-panel" style={{ color: "var(--text-dim)" }}>Loading…</div>

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
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => openEditor("sheets-editor")}>
        <Icon icon={IconNames.GRID_VIEW} size={14} />
        <span>Google Sheets 数据编辑</span>
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
  const { propertiesVisible, setPropertiesVisible } = useDocSettingsStore()

  const handleRightVisibleChange = useCallback(
    (v: boolean) => setPropertiesVisible(v),
    [setPropertiesVisible],
  )

  return (
    <DockLayout
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
  return (
    <SheetsProvider clientId={CLIENT_ID} spreadsheetId={SPREADSHEET_ID}>
      <PlanAwareApp />
    </SheetsProvider>
  )
}

export default App
