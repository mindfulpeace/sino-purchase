import { useState, useCallback, useMemo } from "react"
import { Button, InputGroup, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { usePlan } from "./plan/PlanContext"
import { TaskList } from "./plan/components/TaskList"
import { SortBar } from "./plan/components/SortBar"
import { AddNewTaskBar } from "./plan/components/AddNewTaskBar"
import { FilterModals } from "./plan/components/FilterModals"
import { BatchImportDialog } from "./plan/components/BatchImportDialog"
import { BatchConfirmDialog } from "./plan/components/BatchConfirmDialog"
import { SettingsDialog } from "./plan/components/SettingsDialog"
import { STATUS_BADGE } from "./plan/types"
import type { PurchaseTask } from "./plan/types"
import "./plan/PlanManagement.css"

export default function PlanManagement() {
  const {
    tasks, allTasks, loading, reload, addTask,
    searchQuery, setSearchQuery,
    statusFilter,
    urgencyFilter,
    supplierFilter, bookerFilter,
    groupBy,
    setEditingTaskId, setIsAdding, setBatchEdit,
    selectedIds, onToggleSelect, clearSelection,
    pendingBatchChanges, setPendingBatchChanges,
    confirmBatchApply,
  } = usePlan()

  const [showSettings, setShowSettings] = useState(false)
  const [showBatch, setShowBatch] = useState(false)

  const handleRequestEdit = useCallback((id: string) => {
    setEditingTaskId(id)
    setIsAdding(false)
    setBatchEdit(false)
  }, [setEditingTaskId, setIsAdding, setBatchEdit])

  const handleOpenAdd = useCallback(() => {
    setIsAdding(true)
    setEditingTaskId(null)
    setBatchEdit(false)
  }, [setIsAdding, setEditingTaskId, setBatchEdit])

  const handleAddFromBar = useCallback((data: Partial<PurchaseTask>) => {
    addTask(data)
  }, [addTask])

  const handleBatchImport = useCallback((tasks: Partial<PurchaseTask>[]) => {
    for (const t of tasks) addTask(t)
  }, [addTask])

  const statusLabel = useMemo(
    () => statusFilter.length > 0 ? statusFilter.map(s => STATUS_BADGE[s]).join("") : "状态",
    [statusFilter],
  )
  const urgencyLabel = useMemo(
    () => urgencyFilter.length > 0 ? [...urgencyFilter].sort().join("") : "紧急",
    [urgencyFilter],
  )
  const supplierLabel = useMemo(() => supplierFilter ? `@${supplierFilter}` : "商家", [supplierFilter])
  const bookerLabel = useMemo(() => bookerFilter ? `#${bookerFilter}` : "预定", [bookerFilter])

  return (
    <div className="plan-root">
      {/* Header stats */}
      <div className="plan-hdr">
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          <Button small minimal icon={<Icon icon={IconNames.REFRESH} />} onClick={reload}>刷新</Button>
          <Button small minimal icon={<Icon icon={IconNames.COG} />} onClick={() => setShowSettings(true)}>设置</Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="plan-filter">
        <Button
          small
          minimal
          className={statusFilter.length > 0 ? "plan-filter-btn on" : "plan-filter-btn"}
          onClick={() => setShowFilter("status")}
        >
          {statusLabel}
        </Button>
        <Button
          small
          minimal
          className={urgencyFilter.length > 0 ? "plan-filter-btn on" : "plan-filter-btn"}
          onClick={() => setShowFilter("urgency")}
        >
          {urgencyLabel}
        </Button>
        <Button
          small
          minimal
          className={supplierFilter ? "plan-filter-btn on" : "plan-filter-btn"}
          onClick={() => setShowFilter("supplier")}
        >
          {supplierLabel}
        </Button>
        <Button
          small
          minimal
          className={bookerFilter ? "plan-filter-btn on" : "plan-filter-btn"}
          onClick={() => setShowFilter("booker")}
        >
          {bookerLabel}
        </Button>
        <InputGroup
          className="plan-search"
          placeholder="搜索品名/品牌/规格/商家/预定人"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          small
        />
      </div>

      {/* Sort bar */}
      <SortBar />

      {/* Scrollable task list */}
      <div className="plan-scroll">
        <FilterModals />

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
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
          />
        )}
      </div>

      {/* Bottom: quick add + status */}
      <div style={{ flexShrink: 0 }}>
        <AddNewTaskBar onAdd={handleAddFromBar} onOpenAdd={handleOpenAdd} onBatch={() => setShowBatch(true)} />
        <div className="plan-status">
          {selectedIds.size > 0 ? (
            <>
              <span>{selectedIds.size} 项已选</span>
              <button onClick={() => {
                const lines = allTasks.filter(t => selectedIds.has(t.id)).map(t => {
                  let s = t.name
                  if (t.brand) s += `(${t.brand})`
                  if (t.spec) s += `-${t.spec}`
                  s += ` x${t.quantity ?? 1}${t.unit || ""}`
                  return s
                })
                navigator.clipboard.writeText(lines.join("\n"))
              }}>复制</button>
              <button onClick={() => {
                setPendingBatchChanges({})
                setBatchEdit(true)
                setEditingTaskId(null)
                setIsAdding(false)
              }}>编辑</button>
              <button onClick={clearSelection}>取消</button>
            </>
          ) : (
            <span>{allTasks.length} 项</span>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <BatchImportDialog isOpen={showBatch} onClose={() => setShowBatch(false)} onImport={handleBatchImport} />
      <BatchConfirmDialog isOpen={Object.keys(pendingBatchChanges).length > 0} changes={pendingBatchChanges} count={selectedIds.size} onConfirm={confirmBatchApply} onClose={() => setPendingBatchChanges({})} />
    </div>
  )
}
