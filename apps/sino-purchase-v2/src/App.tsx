import { lazy, Suspense, useState, useCallback, useEffect } from "react"
import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { ThemeProvider, AppLayout } from "@sino-purchase/desk-ui"
import { SheetsProvider } from "@sino-purchase/sheets-api"
import { CLIENT_ID, SPREADSHEET_ID } from "./config/sheets"
import { PlanProvider, usePlan } from "./pages/plan/PlanContext"
import { TaskDetail } from "./pages/plan/components/TaskDetail"
import type { PurchaseTask } from "./pages/plan/types"
import { todayISO } from "./pages/plan/helpers"
import { DocSettingsProvider } from "./context/DocSettingsContext"
import AccountingSettings from "./pages/accounting/AccountingSettings"

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
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 4, fontSize: 13 }}
          onClick={() => openTab("accounting")}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Icon icon={IconNames.PRINT} size={16} />
          <span>费用报销单</span>
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

function PlanAwareApp() {
  const [propertiesVisible, setPropertiesVisible] = useState(false)
  const { editingTaskId, isAdding, batchEdit, selectedIds, allTasks, addTask, updateTask, deleteTask, setEditingTaskId, setIsAdding, setBatchEdit, setPendingBatchChanges } = usePlan()

  useEffect(() => {
    if (editingTaskId || isAdding) setPropertiesVisible(true)
  }, [editingTaskId, isAdding])

  const handlePropertiesClose = useCallback(() => {
    setPropertiesVisible(false)
    setEditingTaskId(null)
    setIsAdding(false)
    setBatchEdit(false)
  }, [setEditingTaskId, setIsAdding, setBatchEdit])

  const propertiesPanel = useCallback((activeId: string | null) => {
    if (activeId === "accounting") {
      return {
        id: "accounting-settings",
        label: "文档设置",
        render: () => <AccountingSettings />,
      }
    }

    if (activeId !== "plan") return undefined

    const defaultInitial: Partial<PurchaseTask> = {
      name: "", quantity: 1, unit: "个", urgency: 2, status: 1,
      currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣",
      plannedDate: todayISO(),
    }

    if (editingTaskId) {
      const task = allTasks.find(t => t.id === editingTaskId)
      if (!task) return undefined
      return {
        id: "plan-detail",
        label: "任务详情",
        render: () => (
          <TaskDetail
            initial={task}
            mode="edit"
            onSave={data => updateTask(editingTaskId, data)}
            onCancel={handlePropertiesClose}
            onDelete={() => deleteTask(editingTaskId)}
          />
        ),
      }
    }

    if (isAdding) {
      return {
        id: "plan-detail",
        label: "新任务",
        render: () => (
          <TaskDetail
            initial={defaultInitial}
            mode="add"
            onSave={data => addTask(data)}
            onCancel={handlePropertiesClose}
          />
        ),
      }
    }

    if (batchEdit && selectedIds.size > 0) {
      return {
        id: "plan-batch",
        label: "批量编辑",
        render: () => (
          <TaskDetail
            initial={defaultInitial}
            mode="batch"
            selectedCount={selectedIds.size}
            onSave={data => setPendingBatchChanges(data)}
            onCancel={handlePropertiesClose}
          />
        ),
      }
    }

    return undefined
  }, [editingTaskId, isAdding, batchEdit, selectedIds, allTasks, addTask, updateTask, deleteTask, handlePropertiesClose, setPendingBatchChanges])

  return (
    <AppLayout
      title="sino-purchase-v2"
      activities={activities}
      sidePanels={sidePanels}
      tabs={tabs}
      propertiesPanel={propertiesPanel}
      propertiesVisible={propertiesVisible}
      onPropertiesVisibleChange={setPropertiesVisible}
    />
  )
}

function App() {
  return (
    <SheetsProvider clientId={CLIENT_ID} spreadsheetId={SPREADSHEET_ID}>
      <ThemeProvider>
        <PlanProvider>
          <DocSettingsProvider>
            <PlanAwareApp />
          </DocSettingsProvider>
        </PlanProvider>
      </ThemeProvider>
    </SheetsProvider>
  )
}

export default App
