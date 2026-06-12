import { lazy, Suspense, useCallback, useMemo } from "react"
import { Icon, Button, InputGroup } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { ThemeProvider, AppLayout, usePropertiesFeedback } from "@sino-purchase/desk-ui"
import { SheetsProvider, useAuth } from "@sino-purchase/sheets-api"
import { CLIENT_ID, SPREADSHEET_ID } from "./config/sheets"
import { usePlanStore } from "./app/stores/planStore"
import { useDocSettingsStore } from "./app/stores/docSettingsStore"
import { TaskDetail } from "./modules/plan/components/TaskDetail"
import { FilterPopover } from "./modules/plan/components/FilterModals"
// SettingsDialog is rendered inside PlanManagement to stay within OverlaysProvider
import type { PurchaseTask } from "./modules/plan/types"
import { todayISO } from "./modules/plan/helpers"
import AccountingSettings from "./modules/accounting/AccountingSettings"

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

const sidePanels: Record<string, { id: string; label: string; render: (callbacks: { openTab: (id: string) => void }) => React.ReactNode }> = {
  plan: {
    id: "plan",
    label: "计划管理",
    render: ({ openTab }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 8 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 4, fontSize: 13 }}
          onClick={() => openTab("plan")}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Icon icon={IconNames.SHOPPING_CART} size={16} />
          <span>采购清单</span>
        </div>
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
    render: ({ openTab }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 8 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 4, fontSize: 13 }}
          onClick={() => openTab("accounting")}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Icon icon={IconNames.DOLLAR} size={16} />
          <span>现金日记账</span>
        </div>
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

/* ── 属性栏分段标题 ────────────────────────── */

const sectionHeader = (title: string) => (
  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-dim)", padding: "8px 12px 4px", borderBottom: "1px solid var(--border)" }}>
    {title}
  </div>
)

/* ── 计划管理属性栏内容 ────────────────────── */

function PlanPropertiesContent() {
  const {
    searchQuery, setSearchQuery, reload, setShowSettings,
    editingTaskId, detailReadOnly, isAdding, batchEdit, selectedIds, allTasks,
    addTask, updateTask, deleteTask, setEditingTaskId, setIsAdding,
    setBatchEdit, setPendingBatchChanges,
    urgentAll, urgentHigh, urgentMid, urgentLow, completed,
  } = usePlanStore()
  const { setPropertiesVisible } = useDocSettingsStore()
  const feedback = usePropertiesFeedback()

  const handlePropertiesClose = useCallback(() => {
    setPropertiesVisible(false)
    setEditingTaskId(null)
    setIsAdding(false)
    setBatchEdit(false)
  }, [setPropertiesVisible, setEditingTaskId, setIsAdding, setBatchEdit])

  const defaultInitial: Partial<PurchaseTask> = {
    name: "", quantity: 1, unit: "个", urgency: 2, status: 1,
    currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣",
    plannedDate: todayISO(),
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* 信息统计 */}
      {sectionHeader("信息统计")}
      <div style={{ display: "flex", gap: 8, padding: "6px 12px", fontSize: 12, color: "var(--text-dim)", flexWrap: "wrap" }}>
        <span>{allTasks.length} 项</span>
        {urgentAll > 0 && <span style={{ color: "#e65100" }}>紧急 {urgentHigh}</span>}
        {completed > 0 && <span style={{ color: "#2e7d32" }}>完成 {completed}</span>}
        {selectedIds.size > 0 && <span>已选 {selectedIds.size}</span>}
      </div>

      {/* 筛选 */}
      {sectionHeader("筛选")}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", padding: "6px 12px" }}>
        <FilterPopover type="status" label="状态" />
        <FilterPopover type="urgency" label="紧急" />
        <FilterPopover type="supplier" label="商家" />
        <FilterPopover type="booker" label="预定" />
        <InputGroup
          placeholder="搜索品名/品牌/规格/商家/预定人"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          small
          style={{ width: 130 }}
        />
        <div style={{ flex: 1 }} />
        <Button small minimal icon={<Icon icon={IconNames.REFRESH} />} onClick={() => { reload(); feedback.log("已刷新") }} />
        <Button small minimal icon={<Icon icon={IconNames.COG} />} onClick={() => setShowSettings(true)} />
      </div>

      {/* 编辑 detail */}
      {sectionHeader("编辑 detail")}
      <div style={{ padding: "0 12px" }}>
        {editingTaskId && (() => {
          const task = allTasks.find(t => t.id === editingTaskId)
          if (!task) return null
          return (
            <TaskDetail
              initial={task}
              mode="edit"
              readOnly={detailReadOnly}
              onSave={data => { updateTask(editingTaskId, data); feedback.log("已保存") }}
              onCancel={handlePropertiesClose}
              onDelete={() => { deleteTask(editingTaskId); feedback.log("已删除") }}
            />
          )
        })()}

        {isAdding && (
          <TaskDetail
            initial={defaultInitial}
            mode="add"
            onSave={data => { addTask(data); feedback.log("已添加") }}
            onCancel={handlePropertiesClose}
          />
        )}

        {batchEdit && selectedIds.size > 0 && (
          <TaskDetail
            initial={defaultInitial}
            mode="batch"
            selectedCount={selectedIds.size}
            onSave={data => { setPendingBatchChanges(data); feedback.log(`已设置 ${selectedIds.size} 项的批量修改`) }}
            onCancel={handlePropertiesClose}
          />
        )}

        {!editingTaskId && !isAdding && !batchEdit && (
          <div style={{ fontSize: 12, color: "var(--text-dim)", padding: "12px 0", textAlign: "center" }}>
            点击任务项查看详情
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 计划管理底部工具栏（选中工具栏） ────────── */

function PlanSelectionToolbar() {
  const { selectedIds, allTasks, clearSelection, setPendingBatchChanges, setBatchEdit, setEditingTaskId, setIsAdding } = usePlanStore()
  const feedback = usePropertiesFeedback()

  if (selectedIds.size === 0) return null

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", fontSize: 12 }}>
      <span style={{ color: "var(--text-dim)" }}>{selectedIds.size} 项已选</span>
      <span style={{ width: 1, height: 14, background: "var(--border)" }} />
      <button
        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--accent)", fontSize: 12 }}
        onClick={() => {
          const lines = allTasks.filter(t => selectedIds.has(t.id)).map(t => {
            let s = t.name
            if (t.brand) s += `(${t.brand})`
            if (t.spec) s += `-${t.spec}`
            s += ` x${t.quantity ?? 1}${t.unit || ""}`
            return s
          })
          navigator.clipboard.writeText(lines.join("\n"))
          feedback.log(`已复制 ${selectedIds.size} 项`)
        }}
      >复制</button>
      <button
        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--accent)", fontSize: 12 }}
        onClick={() => {
          setPendingBatchChanges({})
          setBatchEdit(true)
          setEditingTaskId(null)
          setIsAdding(false)
        }}
      >批量编辑</button>
      <button
        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-dim)", fontSize: 12 }}
        onClick={clearSelection}
      >取消</button>
    </div>
  )
}

/* ── 计划管理状态信息（属性栏底部） ─────────── */

function PlanStatusInfo() {
  const { allTasks, selectedIds } = usePlanStore()
  return (
    <span style={{ fontSize: 11, color: "var(--text-dim)", padding: "0 12px" }}>
      {allTasks.length} 项{selectedIds.size > 0 ? ` | 已选 ${selectedIds.size}` : ""}
    </span>
  )
}

/* ── PlanAwareApp ─────────────────────────── */

function PlanAwareApp() {
  const auth = useAuth()
  const { propertiesVisible, setPropertiesVisible } = useDocSettingsStore()

  const loginButton = (
    <button
      className="nav-item"
      onClick={auth.loggedIn ? auth.logout : auth.login}
      title={auth.loggedIn ? "已登录" : "登录 Google"}
    >
      <Icon icon={auth.loggedIn ? IconNames.USER : IconNames.LOG_IN} size={20} />
    </button>
  )

  const propertiesPanel = useCallback((activeId: string | null) => {
    if (activeId === "accounting") {
      return {
        id: "accounting-settings",
        label: "打印设置",
        render: () => <AccountingSettings />,
      }
    }

    if (activeId !== "plan") return undefined

    return {
      id: "plan",
      label: "计划管理",
      render: () => <PlanPropertiesContent />,
    }
  }, [])

  const tabs: {
    id: string
    label: string
    render: () => React.ReactNode
    bottomToolbar?: () => React.ReactNode
  }[] = [
    { id: "plan", label: "计划管理", render: () => <Suspense fallback={fallback}><PlanManagement /></Suspense>, bottomToolbar: () => <PlanSelectionToolbar /> },
    { id: "material", label: "物料信息", render: () => <Suspense fallback={fallback}><MaterialInfo /></Suspense> },
    { id: "accounting", label: "记账报销", render: () => <Suspense fallback={fallback}><Accounting /></Suspense> },
    { id: "payments", label: "往来付款", render: () => <Suspense fallback={fallback}><Payments /></Suspense> },
    { id: "sheets-editor", label: "Google Sheets", render: () => <Suspense fallback={fallback}><SheetsEditor /></Suspense> },
  ]

  return (
    <>
      <AppLayout
        title="sino-purchase-v2"
        activities={activities}
        activityBarFooter={loginButton}
        sidePanels={sidePanels}
        tabs={tabs}
        propertiesPanel={propertiesPanel}
        propertiesMinWidth={260}
        propertiesVisible={propertiesVisible}
        onPropertiesVisibleChange={setPropertiesVisible}
      />
    </>
  )
}

/* ── App ──────────────────────────────────── */

function App() {
  return (
    <SheetsProvider clientId={CLIENT_ID} spreadsheetId={SPREADSHEET_ID}>
      <ThemeProvider>
        <PlanAwareApp />
      </ThemeProvider>
    </SheetsProvider>
  )
}

export default App
