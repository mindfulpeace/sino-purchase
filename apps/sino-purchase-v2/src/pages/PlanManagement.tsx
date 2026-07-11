import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { Button, ControlGroup, InputGroup, Select, Tabs, Tab, Stack, Box, Skeleton } from "../components/ui"
import { useSheetData } from "@sino-purchase/sheets-react"
import { usePlanStore, filterAndSortTasks } from "../app/stores/planStore"
import { PlanDataContext } from "../app/stores/PlanDataContext"
import { TaskList } from "../modules/plan/components/TaskList"
import { AddNewTaskBar } from "../modules/plan/components/AddNewTaskBar"
import { TaskDetail } from "../modules/plan/components/TaskDetail"
import { StatusFilter, UrgencyFilter, SupplierFilter, BookerFilter } from "../modules/plan/components/FilterModals"
import { BatchImportDialog } from "../modules/plan/components/BatchImportDialog"
import { BatchConfirmDialog } from "../modules/plan/components/BatchConfirmDialog"
// 注意：计划设置已从对话框（SettingsDialog）迁移为右侧「计划设置」面板（PlanSettingsPanel）。
import type { PurchaseTask, GroupBy, SortBy } from "../modules/plan/types"
import { TASK_HEADERS, NUMERIC_FIELDS, DATE_FIELDS } from "../modules/plan/types"
import { DEMO_TASKS } from "../config/demo-data"

const SHEET = "tasks"

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "plannedDate", label: "日期" },
  { value: "status", label: "状态" },
  { value: "urgency", label: "紧急" },
  { value: "supplier", label: "商家" },
  { value: "booker", label: "预定人" },
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
  // P0-1：数据所有权唯一归属 useSheetData（整个模块只此一个实例），通过 Context 共享给子组件。
  const { data, loading, add, update, remove, batchAdd, batchUpdate, reload } = useSheetData<PurchaseTask>({
    sheetName: SHEET,
    headers: TASK_HEADERS,
    numericFields: NUMERIC_FIELDS,
    dateFields: DATE_FIELDS,
    demoData: DEMO_TASKS,
  })

  const {
    statusFilter, urgencyFilter, supplierFilter, bookerFilter,
    dateStart, dateEnd, dateEndToday, searchQuery, sortBy, groupBy,
    setGroupBy, setSortBy, setSearchQuery,
    editingTaskId, setEditingTaskId, setIsAdding, setBatchEdit,
    selectedIds, clearSelection,
  } = usePlanStore()

  // 过滤/排序在组件层基于 useSheetData 数据 + store 的筛选态计算（store 不再持有数据副本）
  const filteredTasks = useMemo(
    () => filterAndSortTasks(data, { statusFilter, urgencyFilter, supplierFilter, bookerFilter, sortBy, groupBy, dateStart, dateEnd, dateEndToday, searchQuery }),
    [data, statusFilter, urgencyFilter, supplierFilter, bookerFilter, sortBy, groupBy, dateStart, dateEnd, dateEndToday, searchQuery],
  )

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

  const handleAddFromBar = useCallback((d: Partial<PurchaseTask>) => {
    add(d)
  }, [add])

  const handleSaveDetail = useCallback((d: Partial<PurchaseTask>) => {
    const { editingTaskId } = usePlanStore.getState()
    // 折叠时保存：store 里的 editingTaskId 可能已切换/清空，优先用草稿自带的 id
    const id = (d as Record<string, unknown>).id ?? editingTaskId
    if (!id) return
    const { id: _omit, ...rest } = d as Record<string, unknown>
    update(id as string, rest as Partial<PurchaseTask>)
  }, [update])

  const handleCancelDetail = useCallback(() => {
    setEditingTaskId(null)
    setIsAdding(false)
  }, [setEditingTaskId, setIsAdding])

  const handleDeleteDetail = useCallback((id: string) => {
    remove(id)
  }, [remove])

  const handleBatchDelete = useCallback(() => {
    const ids = selectedIds
    for (const id of ids) remove(id)
    setShowBatchEdit(false)
    clearSelection()
  }, [selectedIds, clearSelection, setShowBatchEdit, remove])

  /* ── Batch edit ── */

  // 多选后自动展开批量编辑表单：选中即从当前选中任务推导公共初值并显示，
  // 取消选中（取消选择 / 应用 / 删除）时收起。取消「编辑」独立按钮（详情随选中自动出现）。
  useEffect(() => {
    if (selectedIds.length === 0) {
      setShowBatchEdit(false)
      return
    }
    const sel = data.filter(t => selectedIds.includes(t.id))
    const c: Record<string, unknown> = {}
    const fields: (keyof PurchaseTask)[] = ["name", "brand", "spec", "quantity", "unit", "unitPrice", "status", "urgency", "currency", "exchangeRate", "taxStatus", "supplierId", "bookerId", "plannedDate", "receivedDate", "reimbursementDate"]
    for (const field of fields) {
      const val = sel[0]?.[field]
      if (sel.every(t => t[field] === val || (!val && !t[field]))) c[field] = val
    }
    const composite = c as Partial<PurchaseTask>
    batchInitialRef.current = composite
    setBatchInitial(composite)
    setShowBatchEdit(true)
  }, [selectedIds, data])

  const closeBatchEdit = useCallback(() => {
    setShowBatchEdit(false)
  }, [])

  const handleBatchSave = useCallback((d: Partial<PurchaseTask>) => {
    const init = batchInitialRef.current
    const changes: Partial<PurchaseTask> = {}
    for (const k of Object.keys(d) as (keyof PurchaseTask)[]) {
      if (d[k] !== init[k]) (changes as Record<string, unknown>)[k] = d[k]
    }
    if (!Object.keys(changes).length) return
    setBatchChanges(changes)
    setShowBatchConfirm(true)
  }, [])

  const confirmBatchApplyLocal = useCallback(() => {
    const ids = selectedIds
    batchUpdate(ids.map(id => ({ id, changes: batchChanges })))
    setShowBatchConfirm(false)
    setShowBatchEdit(false)
    clearSelection()
  }, [selectedIds, batchChanges, clearSelection, batchUpdate])

  const copySelected = useCallback(() => {
    const lines = data.filter(t => selectedIds.includes(t.id)).map(t => {
      let s = t.name
      if (t.brand) s += `(${t.brand})`
      if (t.spec) s += `-${t.spec}`
      s += ` x${t.quantity ?? 1}${t.unit || ""}`
      return s
    })
    navigator.clipboard.writeText(lines.join("\n"))
  }, [data, selectedIds])

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
    batchAdd(tasks)
  }, [batchAdd])

  /* ── 批量操作 Portal 挂载点（右侧「批量操作」面板） ── */
  // 右侧面板是独立 dock panel，通过 DOM slot + Portal 复用本组件的 useSheetData 数据实例。
  const [batchSlot, setBatchSlot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const find = () => {
      const el = document.getElementById("plan-batch-actions-slot")
      setBatchSlot(prev => (prev === el ? prev : el))
    }
    find()
    // slot 可能随右侧面板显隐/编辑区切换而挂载或卸载，轮询保证 Portal 目标始终有效
    const timer = window.setInterval(find, 500)
    return () => window.clearInterval(timer)
  }, [])

  const batchActions = (
    <>
      {selectedIds.length > 0 && (
        <Stack direction="row" className="plan-selbar" sx={{ gap: 0.5, flexWrap: "wrap" }}>
          <Button small minimal onClick={copySelected}>复制信息</Button>
          <Button small minimal onClick={clearSelection}>取消选择</Button>
        </Stack>
      )}
      {showBatchEdit && (
        <Box className="plan-batch">
          <TaskDetail
            initial={batchInitial}
            mode="batch"
            selectedCount={selectedIds.length}
            onSave={handleBatchSave}
            onCancel={closeBatchEdit}
            onDelete={handleBatchDelete}
          />
        </Box>
      )}
    </>
  )

  return (
    <PlanDataContext.Provider value={{ tasks: data, loading, add, update, remove, reload }}>
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
              tasks={filteredTasks}
              groupBy={groupBy}
              onRequestEdit={handleRequestEdit}
              editingId={editingTaskId}
              onSave={handleSaveDetail}
              onCancel={handleCancelDetail}
              onDelete={handleDeleteDetail}
            />
          )}
        </Box>

        {/* 批量操作（选中操作条 + 批量编辑表单）仅通过 Portal 渲染到右侧「批量操作」面板。
            右侧 slot 不存在（切到「计划设置」或面板未就绪）时不渲染——隐藏，绝不出现在中间区。 */}
        {batchSlot && createPortal(batchActions, batchSlot)}

        {/* Quick add bar */}
        <Box className="plan-addbar" sx={{ flexShrink: 0, display: "flex", gap: 1, alignItems: "center", p: "4px 3px", borderTop: "1px solid var(--dv-separator-border, var(--border))" }}>
          <AddNewTaskBar
            onAdd={handleAddFromBar}
            onOpenAdd={handleOpenAdd}
            onBatch={() => setShowBatch(true)}
          />
        </Box>

        {/* Dialogs */}
        <BatchImportDialog isOpen={showBatch} onClose={() => setShowBatch(false)} onImport={handleBatchImport} />
        <BatchConfirmDialog
          isOpen={showBatchConfirm}
          changes={batchChanges}
          count={selectedIds.length}
          onConfirm={confirmBatchApplyLocal}
          onClose={() => setShowBatchConfirm(false)}
        />
      </Stack>
    </PlanDataContext.Provider>
  )
}
