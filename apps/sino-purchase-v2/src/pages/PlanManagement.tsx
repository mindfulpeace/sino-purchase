import { useState, useCallback, useEffect, useRef } from "react"
import { Button, ControlGroup, InputGroup, Select, Tabs, Tab, Stack, Box, Skeleton } from "../components/ui"
import { useSheetData } from "@sino-purchase/sheets-react"
import { usePlanStore } from "../app/stores/planStore"
import { TaskList } from "../modules/plan/components/TaskList"
import { AddNewTaskBar } from "../modules/plan/components/AddNewTaskBar"
import { TaskDetail } from "../modules/plan/components/TaskDetail"
import { StatusFilter, UrgencyFilter, SupplierFilter, BookerFilter } from "../modules/plan/components/FilterModals"
import { SettingsDialog } from "../modules/plan/components/SettingsDialog"
import { BatchImportDialog } from "../modules/plan/components/BatchImportDialog"
import { BatchConfirmDialog } from "../modules/plan/components/BatchConfirmDialog"
import type { PurchaseTask, GroupBy, SortBy } from "../modules/plan/types"
import { TASK_HEADERS, NUMERIC_FIELDS, DATE_FIELDS } from "../modules/plan/types"
import { DEMO_TASKS } from "../config/demo-data"

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
    demoData: DEMO_TASKS,
  })

  const {
    allTasks, loading, filteredTasks: tasks, setAllTasks, setCrudActions,
    searchQuery, setSearchQuery,
    groupBy,
    setGroupBy, setSortBy, sortBy,
    editingTaskId, setEditingTaskId, setIsAdding, setBatchEdit,
    selectedIds, clearSelection,
    addTask,
    showSettings, setShowSettings,
  } = usePlanStore()

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

  /* ── Detail editing ── */

  const handleRequestEdit = useCallback((id: string) => {
    setShowBatchEdit(show => (show ? false : show))
    setIsAdding(false)
    setBatchEdit(false)
    const { editingTaskId } = usePlanStore.getState()
    setEditingTaskId(editingTaskId === id ? null : id)
  }, [setShowBatchEdit, setIsAdding, setBatchEdit, setEditingTaskId])

  const handleOpenAdd = useCallback(() => {
    setIsAdding(true)
    setEditingTaskId(null)
    setBatchEdit(false)
  }, [setIsAdding, setEditingTaskId, setBatchEdit])

  const handleAddFromBar = useCallback((data: Partial<PurchaseTask>) => {
    addTask(data)
  }, [addTask])

  const handleSaveDetail = useCallback((data: Partial<PurchaseTask>) => {
    const { editingTaskId, updateTask } = usePlanStore.getState()
    // 折叠时保存：store 里的 editingTaskId 可能已切换/清空，优先用草稿自带的 id
    const id = (data as Record<string, unknown>).id ?? editingTaskId
    if (!id) return
    const { id: _omit, ...rest } = data as Record<string, unknown>
    updateTask(id as string, rest as Partial<PurchaseTask>)
  }, [])

  const handleCancelDetail = useCallback(() => {
    setEditingTaskId(null)
    setIsAdding(false)
  }, [setEditingTaskId, setIsAdding])

  const handleDeleteDetail = useCallback((id: string) => {
    const { deleteTask } = usePlanStore.getState()
    deleteTask(id)
  }, [])

  const handleBatchDelete = useCallback(() => {
    const ids = [...selectedIds]
    const { deleteTask } = usePlanStore.getState()
    for (const id of ids) deleteTask(id)
    setShowBatchEdit(false)
    clearSelection()
  }, [selectedIds, clearSelection, setShowBatchEdit])

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
  }, [allTasks, selectedIds])

  /* ── Keyboard ── */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && tag !== "INPUT" && tag !== "TEXTAREA") {
        const input = document.querySelector<HTMLInputElement>('[placeholder="品名 回车快速添加"]')
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

  return (
    <Stack className="plan-root" sx={{ height: "100%" }}>
      {/* Filter bar */}
      <Stack direction="row" className="plan-toolbar" sx={{ flexShrink: 0, flexWrap: "wrap", gap: "2px", alignItems: "center", p: "4px 3px 0" }}>
        <ControlGroup fill>
          <StatusFilter />
          <UrgencyFilter />
          <SupplierFilter />
          <BookerFilter />
          <InputGroup
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索品名/品牌/规格/商家/预定人"
            style={{ minWidth: 80, flex: 1 }}
          />
        </ControlGroup>
      </Stack>

      {/* Sort bar */}
      <Stack direction="row" className="plan-sortbar" sx={{ flexShrink: 0, justifyContent: "space-between", alignItems: "center", gap: "2px", p: "2px 3px 0" }}>
        <Tabs value={groupBy} onChange={(v: any) => setGroupBy(v as GroupBy)}>
          {GROUP_OPTIONS.map(o => (
            <Tab key={o.value} value={o.value} label={o.label} />
          ))}
        </Tabs>
        <Select
          value={sortBy}
          options={SORT_OPTIONS.filter(o => o.value !== GROUP_SORT_MAP[groupBy]).map(o => ({ value: o.value, label: o.label }))}
          onChange={v => setSortBy(v as SortBy)}
        />
      </Stack>

      {/* Scrollable task list */}
      <Box className="plan-scroll" sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: "0 3px 3px" }}>
        {loading ? (
          <Box className="plan-loading" sx={{ p: 1 }}>
            <Skeleton width={80} height={14} sx={{ mb: 0.5 }} />
            <Skeleton width="92%" height={16} sx={{ mb: 0.25 }} />
            <Skeleton width="78%" height={16} sx={{ mb: 0.25 }} />
            <Skeleton width="62%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton width={80} height={14} sx={{ mb: 0.5 }} />
            <Skeleton width="85%" height={16} sx={{ mb: 0.25 }} />
            <Skeleton width="72%" height={16} sx={{ mb: 0.25 }} />
            <Skeleton width="55%" height={16} sx={{ mb: 0.25 }} />
            <Skeleton width="82%" height={16} />
          </Box>
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
      </Box>

      {/* Batch edit detail */}
      {showBatchEdit && (
        <Box className="plan-batch">
          <TaskDetail
            initial={batchInitial}
            mode="batch"
            selectedCount={selectedIds.size}
            onSave={handleBatchSave}
            onCancel={closeBatchEdit}
            onDelete={handleBatchDelete}
          />
        </Box>
      )}

      {/* Quick add bar */}
      <Box className="plan-addbar" sx={{ flexShrink: 0, display: "flex", gap: 1, alignItems: "center", p: "4px 3px", borderTop: "1px solid var(--dv-separator-border, var(--border))" }}>
        <AddNewTaskBar
          onAdd={handleAddFromBar}
          onOpenAdd={handleOpenAdd}
          onBatch={() => setShowBatch(true)}
        />
      </Box>

      {/* Status bar extras (buttons when selected) */}
      {selectedIds.size > 0 && (
        <Stack direction="row" className="plan-selbar">
          <Button small minimal onClick={copySelected}>复制</Button>
          <Button small minimal onClick={openBatchEdit}>编辑</Button>
          <Button small minimal onClick={clearSelection}>取消</Button>
        </Stack>
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
    </Stack>
  )
}
