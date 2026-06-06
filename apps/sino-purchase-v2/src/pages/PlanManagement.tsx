import { useState, useCallback, useEffect } from "react"
import { Button, InputGroup, Icon, Tag } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useAuth } from "@sino-purchase/sheets-api"
import { usePlan } from "./plan/PlanContext"
import { TaskList } from "./plan/components/TaskList"
import { AddNewTaskBar } from "./plan/components/AddNewTaskBar"
import { FilterPopover } from "./plan/components/FilterModals"
import { BatchImportDialog } from "./plan/components/BatchImportDialog"
import { BatchConfirmDialog } from "./plan/components/BatchConfirmDialog"
import { SettingsDialog } from "./plan/components/SettingsDialog"
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
    selectedIds, onToggleSelect, clearSelection, selectAll,
    pendingBatchChanges, setPendingBatchChanges,
    confirmBatchApply,
  } = usePlan()

  const auth = useAuth()
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

  return (
    <div className="plan-root">
      {/* Header stats */}
      <div className="plan-hdr">
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          {!auth.loggedIn ? (
            <Button small minimal icon={<Icon icon={IconNames.LOG_IN} />} onClick={auth.login}>登录 Google</Button>
          ) : (
            <Tag minimal>已登录</Tag>
          )}
          <Button small minimal icon={<Icon icon={IconNames.REFRESH} />} onClick={reload}>刷新</Button>
          <Button small minimal icon={<Icon icon={IconNames.COG} />} onClick={() => setShowSettings(true)}>设置</Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="plan-filter">
        <FilterPopover type="status" label="状态" active={statusFilter.length > 0} />
        <FilterPopover type="urgency" label="紧急" active={urgencyFilter.length > 0} />
        <FilterPopover type="supplier" label="商家" active={!!supplierFilter} />
        <FilterPopover type="booker" label="预定" active={!!bookerFilter} />
        <InputGroup
          className="plan-search"
          placeholder="搜索品名/品牌/规格/商家/预定人"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          small
        />
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
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onSelectAll={() => {
              if (selectedIds.size === tasks.length) clearSelection()
              else selectAll(tasks.map(t => t.id))
            }}
          />
        )}
      </div>

      {/* Selection toolbar */}
      {selectedIds.size > 0 && (
        <div className="plan-selbar">
          <span>{selectedIds.size} 项已选</span>
          <span className="selbar-divider" />
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
          }}>批量编辑</button>
          <button onClick={clearSelection} className="selbar-cancel">取消</button>
        </div>
      )}

      {/* Bottom: quick add + status */}
      <div style={{ flexShrink: 0 }}>
        <AddNewTaskBar onAdd={handleAddFromBar} onOpenAdd={handleOpenAdd} onBatch={() => setShowBatch(true)} />
        <div className="plan-status">
          <span>{allTasks.length} 项</span>
        </div>
      </div>

      {/* Dialogs */}
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <BatchImportDialog isOpen={showBatch} onClose={() => setShowBatch(false)} onImport={handleBatchImport} />
      <BatchConfirmDialog isOpen={Object.keys(pendingBatchChanges).length > 0} changes={pendingBatchChanges} count={selectedIds.size} onConfirm={confirmBatchApply} onClose={() => setPendingBatchChanges({})} />
    </div>
  )
}
