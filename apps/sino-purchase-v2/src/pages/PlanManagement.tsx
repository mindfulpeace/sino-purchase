import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { ButtonGroup, Button, HTMLSelect, InputGroup } from "@blueprintjs/core"
import { useSheetData } from "@sino-purchase/sheets-api"
import { useDock } from "@sino-purchase/ui-dock"
import { usePlanStore } from "../app/stores/planStore"
import { TaskList } from "../modules/plan/components/TaskList"
import { AddNewTaskBar } from "../modules/plan/components/AddNewTaskBar"
import { TaskDetail } from "../modules/plan/components/TaskDetail"
import { FilterPopover } from "../modules/plan/components/FilterModals"
import { SettingsDialog } from "../modules/plan/components/SettingsDialog"
import { BatchImportDialog } from "../modules/plan/components/BatchImportDialog"
import { BatchConfirmDialog } from "../modules/plan/components/BatchConfirmDialog"
import type { PurchaseTask, GroupBy, SortBy } from "../modules/plan/types"
import { TASK_HEADERS, NUMERIC_FIELDS, DATE_FIELDS, STATUS_BADGE } from "../modules/plan/types"
import "../modules/plan/plan.css"

const SHEET = "tasks"

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "plannedDate", label: "日期" },
  { value: "status", label: "状态" },
  { value: "urgency", label: "紧急" },
  { value: "supplier", label: "商家" },
  { value: "booker", label: "预定" },
  { value: "none", label: "不分组" },
]

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "createdAt", label: "创建日期" },
  { value: "plannedDate", label: "计划日期" },
  { value: "status", label: "状态" },
  { value: "urgency", label: "紧急" },
  { value: "supplierId", label: "商家" },
  { value: "bookerId", label: "预定人" },
  { value: "receivedDate", label: "入库日期" },
  { value: "reimbursementDate", label: "报销日期" },
  { value: "unitPrice", label: "单价" },
  { value: "currency", label: "币种" },
  { value: "taxStatus", label: "税种" },
  { value: "name", label: "名称" },
  { value: "brand", label: "品牌" },
  { value: "spec", label: "规格" },
  { value: "quantity", label: "数量" },
  { value: "unit", label: "单位" },
  { value: "updatedAt", label: "更新时间" },
]

const GROUP_SORT_MAP: Record<string, SortBy> = {
  plannedDate: "plannedDate",
  status: "status",
  urgency: "urgency",
  supplier: "supplierId",
  booker: "bookerId",
}

export default function PlanManagement() {
  const { data: sheetData, reload: sheetReload, add, update, remove } = useSheetData<PurchaseTask>({
    sheetName: SHEET,
    headers: TASK_HEADERS,
    numericFields: NUMERIC_FIELDS,
    dateFields: DATE_FIELDS,
  })

  const {
    allTasks, loading, filteredTasks: tasks, setAllTasks, setCrudActions,
    searchQuery, setSearchQuery,
    statusFilter, urgencyFilter, supplierFilter, bookerFilter, groupBy,
    setStatusFilter, setUrgencyFilter, setSupplierFilter, setBookerFilter,
    setGroupBy, setSortBy, sortBy,
    editingTaskId, setEditingTaskId, setIsAdding, setBatchEdit,
    selectedIds, onToggleSelect, clearSelection,
    addTask,
    showSettings, setShowSettings,
  } = usePlanStore()

  const { setStatus, setSummary } = useDock()

  // Sync sheet data to store
  useEffect(() => { setAllTasks(sheetData) }, [sheetData])

  // Set CRUD actions
  useEffect(() => {
    setCrudActions({ add, update, remove, reload: sheetReload })
  }, [])

  const [showBatch, setShowBatch] = useState(false)
  const [showBatchEdit, setShowBatchEdit] = useState(false)
  const [batchInitial, setBatchInitial] = useState<Partial<PurchaseTask>>({})
  const batchInitialRef = useRef<Partial<PurchaseTask>>({})
  const [batchChanges, setBatchChanges] = useState<Partial<PurchaseTask>>({})
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)

  // Status bar sync
  const { urgentAll, urgentHigh, urgentMid, urgentLow, completed } = usePlanStore()
  useEffect(() => {
    if (selectedIds.size > 0) {
      setStatus(`${selectedIds.size} 项已选`)
      setSummary(`${allTasks.length - completed} 待办 / ${completed} 完成`)
    } else {
      setStatus(`${allTasks.length} 项`)
      setSummary(`${allTasks.length - completed} 待办 / ${completed} 完成`)
    }
  }, [selectedIds.size, allTasks.length, completed, setStatus, setSummary])

  /* ── Detail editing ── */

  const handleRequestEdit = useCallback((id: string) => {
    if (showBatchEdit) { setShowBatchEdit(false); return }
    setIsAdding(false)
    setBatchEdit(false)
    setEditingTaskId(id)
  }, [setIsAdding, setBatchEdit, setEditingTaskId, showBatchEdit])

  const handleOpenAdd = useCallback(() => {
    setIsAdding(true)
    setEditingTaskId(null)
    setBatchEdit(false)
  }, [setIsAdding, setEditingTaskId, setBatchEdit])

  const handleAddFromBar = useCallback((data: Partial<PurchaseTask>) => {
    addTask(data)
  }, [addTask])

  const handleSaveDetail = useCallback((data: Partial<PurchaseTask>) => {
    if (editingTaskId) {
      const { updateTask } = usePlanStore.getState()
      updateTask(editingTaskId, data)
    }
  }, [editingTaskId])

  const handleCancelDetail = useCallback(() => {
    setEditingTaskId(null)
    setIsAdding(false)
  }, [setEditingTaskId, setIsAdding])

  const handleDeleteDetail = useCallback((id: string) => {
    const { deleteTask } = usePlanStore.getState()
    deleteTask(id)
  }, [])

  /* ── Batch edit ── */

  const openBatchEdit = useCallback(() => {
    setEditingTaskId(null)
    setIsAdding(false)
    const selected = allTasks.filter(t => selectedIds.has(t.id))
    const c: Record<string, unknown> = {}
    const fields: (keyof PurchaseTask)[] = ["name", "brand", "spec", "quantity", "unit", "unitPrice", "status", "urgency", "currency", "exchangeRate", "taxStatus", "supplierId", "bookerId", "plannedDate", "receivedDate", "reimbursementDate"]
    for (const field of fields) {
      const val = selected[0]?.[field]
      if (selected.every(t => t[field] === val || (!val && !t[field]))) c[field] = val
    }
    const composite = c as Partial<PurchaseTask>
    batchInitialRef.current = composite
    setBatchInitial(composite)
    setShowBatchEdit(true)
  }, [allTasks, selectedIds, setEditingTaskId, setIsAdding])

  const closeBatchEdit = useCallback(() => {
    setShowBatchEdit(false)
  }, [])

  const handleBatchSave = useCallback((data: Partial<PurchaseTask>) => {
    const init = batchInitialRef.current
    const changes: Partial<PurchaseTask> = {}
    for (const k of Object.keys(data) as (keyof PurchaseTask)[]) {
      if (data[k] !== init[k]) (changes as Record<string, unknown>)[k] = data[k]
    }
    if (!Object.keys(changes).length) return
    setBatchChanges(changes)
    setShowBatchConfirm(true)
  }, [])

  const confirmBatchApplyLocal = useCallback(() => {
    const ids = [...selectedIds]
    const { updateTask } = usePlanStore.getState()
    for (const id of ids) updateTask(id, batchChanges)
    setShowBatchConfirm(false)
    setShowBatchEdit(false)
    clearSelection()
  }, [selectedIds, batchChanges, clearSelection])

  const copySelected = useCallback(() => {
    const lines = allTasks.filter(t => selectedIds.has(t.id)).map(t => {
      let s = t.name
      if (t.brand) s += `(${t.brand})`
      if (t.spec) s += `-${t.spec}`
      s += ` x${t.quantity ?? 1}${t.unit || ""}`
      return s
    })
    navigator.clipboard.writeText(lines.join("\n"))
    setStatus(`已复制 ${selectedIds.size} 项`)
  }, [allTasks, selectedIds, setStatus])

  /* ── Keyboard ── */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && tag !== "INPUT" && tag !== "TEXTAREA") {
        const input = document.querySelector<HTMLInputElement>(".add-bar input")
        input?.focus()
        e.preventDefault()
      }
      if (e.key === "Escape") {
        clearSelection()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [clearSelection])

  const handleBatchImport = useCallback((tasks: Partial<PurchaseTask>[]) => {
    for (const t of tasks) addTask(t)
  }, [addTask])

  /* ── Filter labels ── */

  const statusLabel = useMemo(() => statusFilter.length > 0 ? statusFilter.map(s => STATUS_BADGE[s]).join("") : "状态", [statusFilter])
  const urgencyLabelStr = useMemo(() => urgencyFilter.length > 0 ? urgencyFilter.sort().join("") : "紧急", [urgencyFilter])
  const supplierLabel = useMemo(() => supplierFilter ? `@${supplierFilter}` : "商家", [supplierFilter])
  const bookerLabel = useMemo(() => bookerFilter ? `#${bookerFilter}` : "预定", [bookerFilter])

  return (
    <div className="plan-root">
      {/* Filter bar */}
      <div className="plan-toolbar">
        <FilterPopover type="status" label={statusLabel} />
        <FilterPopover type="urgency" label={urgencyLabelStr} />
        <FilterPopover type="supplier" label={supplierLabel} />
        <FilterPopover type="booker" label={bookerLabel} />
        <InputGroup
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索品名/品牌/规格/商家/预定人"
        />
      </div>

      {/* Sort bar */}
      <div className="plan-sortbar">
        <ButtonGroup>
          {GROUP_OPTIONS.map(o => (
            <Button
              key={o.value}
              small
              active={groupBy === o.value}
              onClick={() => setGroupBy(o.value)}
            >
              {o.label}
            </Button>
          ))}
        </ButtonGroup>
        <HTMLSelect
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
        >
          {SORT_OPTIONS.filter(o => o.value !== GROUP_SORT_MAP[groupBy]).map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </HTMLSelect>
      </div>

      {/* Scrollable task list */}
      <div className="plan-scroll">
        {loading ? (
          <div className="plan-loading">
            <div className="sk sk-hdr" />
            <div className="sk sk-w92" />
            <div className="sk sk-w78" />
            <div className="sk sk-w62" />
            <div className="sk sk-hdr" />
            <div className="sk sk-w85" />
            <div className="sk sk-w72" />
            <div className="sk sk-w55" />
            <div className="sk sk-w82" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            groupBy={groupBy}
            onRequestEdit={handleRequestEdit}
            editingId={editingTaskId}
            onSave={handleSaveDetail}
            onCancel={handleCancelDetail}
            onDelete={handleDeleteDetail}
          />
        )}
      </div>

      {/* Batch edit detail */}
      {showBatchEdit && (
        <div className="plan-batch-detail">
          <TaskDetail
            initial={batchInitial}
            mode="batch"
            selectedCount={selectedIds.size}
            onSave={handleBatchSave}
            onCancel={closeBatchEdit}
          />
        </div>
      )}

      {/* Quick add bar */}
      <div className="plan-addbar">
        <AddNewTaskBar
          onAdd={handleAddFromBar}
          onOpenAdd={handleOpenAdd}
          onBatch={() => setShowBatch(true)}
        />
      </div>

      {/* Status bar extras (buttons when selected) */}
      {selectedIds.size > 0 && (
        <div style={{
          flexShrink: 0,
          display: "flex",
          gap: 4,
          alignItems: "center",
          padding: "2px 8px",
          borderTop: "1px solid var(--dv-separator-border, #2b2b4a)",
          fontSize: 12,
        }}>
          <Button small minimal onClick={copySelected}>复制</Button>
          <Button small minimal onClick={openBatchEdit}>编辑</Button>
          <Button small minimal onClick={clearSelection}>取消</Button>
        </div>
      )}

      {/* Dialogs */}
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <BatchImportDialog isOpen={showBatch} onClose={() => setShowBatch(false)} onImport={handleBatchImport} />
      <BatchConfirmDialog
        isOpen={showBatchConfirm}
        changes={batchChanges}
        count={selectedIds.size}
        onConfirm={confirmBatchApplyLocal}
        onClose={() => setShowBatchConfirm(false)}
      />
    </div>
  )
}
