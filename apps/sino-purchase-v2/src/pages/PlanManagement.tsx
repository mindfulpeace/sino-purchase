// @ts-nocheck
import { useState, useCallback, useEffect } from "react"
import { useAuth, useSheetData } from "@sino-purchase/sheets-api"
import { usePlanStore } from "../app/stores/planStore"
import { TaskList } from "../modules/plan/components/TaskList"
import { AddNewTaskBar } from "../modules/plan/components/AddNewTaskBar"
import { SettingsDialog } from "../modules/plan/components/SettingsDialog"
import { BatchImportDialog } from "../modules/plan/components/BatchImportDialog"
import { BatchConfirmDialog } from "../modules/plan/components/BatchConfirmDialog"
import type { PurchaseTask } from "../modules/plan/types"
import { TASK_HEADERS, NUMERIC_FIELDS, DATE_FIELDS } from "../modules/plan/types"


const SHEET = "tasks"

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
    statusFilter,
    urgencyFilter,
    supplierFilter, bookerFilter,
    groupBy,
    setEditingTaskId, setIsAdding, setBatchEdit,
    selectedIds, onToggleSelect, clearSelection,
    pendingBatchChanges, setPendingBatchChanges,
    addTask, confirmBatchApply, reload,
    showSettings, setShowSettings,
  } = usePlanStore()

  // Sync sheet data to store
  useEffect(() => { setAllTasks(sheetData) }, [sheetData])

  // Set CRUD actions
  useEffect(() => {
    setCrudActions({ add, update, remove, reload: sheetReload })
  }, [])

  const [showBatch, setShowBatch] = useState(false)

  const handleRequestEdit = useCallback((id: string) => {
    const { editingTaskId, detailReadOnly, setEditingTaskId, setDetailReadOnly } = usePlanStore.getState()
    setIsAdding(false)
    setBatchEdit(false)
    if (editingTaskId === id) {
      setDetailReadOnly(!detailReadOnly)
    } else {
      setEditingTaskId(id) // sets detailReadOnly: true internally
    }
  }, [setIsAdding, setBatchEdit])

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

      {/* Bottom: quick add */}
      <div style={{ flexShrink: 0 }}>
        <AddNewTaskBar onAdd={handleAddFromBar} onOpenAdd={handleOpenAdd} onBatch={() => setShowBatch(true)} />
      </div>

      {/* Dialogs */}
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <BatchImportDialog isOpen={showBatch} onClose={() => setShowBatch(false)} onImport={handleBatchImport} />
      <BatchConfirmDialog
        isOpen={Object.keys(pendingBatchChanges).length > 0}
        changes={pendingBatchChanges}
        count={selectedIds.size}
        onConfirm={confirmBatchApply}
        onClose={() => setPendingBatchChanges({})}
      />
    </div>
  )
}
