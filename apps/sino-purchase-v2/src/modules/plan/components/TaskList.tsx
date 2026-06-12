// @ts-nocheck
import { usePlanStore } from "../../../app/stores/planStore"
import type { PurchaseTask, SortBy } from "../types"
import { TaskItem } from "./TaskItem"

interface Props { tasks: PurchaseTask[]; onRequestEdit: (id: string) => void }

export function TaskList({ tasks, onRequestEdit }: Props) {
  const { sortBy, setSortBy, selectedIds, onToggleSelect, clearSelection, selectAll } = usePlanStore()

  if (tasks.length === 0) return <div className="empty">无任务</div>

  const isActive = (s: SortBy) => s === sortBy

  const allSelected = tasks.length > 0 && tasks.every(t => selectedIds.has(t.id))

  return (<>
    <div className="col-headers">
      <span className="tc cb-col" onClick={() => { if (allSelected) clearSelection(); else selectAll(tasks.map(t => t.id)) }} style={{ cursor: "pointer" }}>{allSelected ? "✓" : ""}</span>
      <span className="tc badge sortable" onClick={() => setSortBy("status")}>{isActive("status") ? "▾" : ""}S</span>
      <span className="tc badge sortable" onClick={() => setSortBy("urgency")}>{isActive("urgency") ? "▾" : ""}U</span>
      <span className="tc name sortable" onClick={() => setSortBy("name")}>{isActive("name") ? "▾品名" : "品名"}</span>
      <span className="tc dim-text sortable" onClick={() => setSortBy("brand")}>{isActive("brand") ? "▾品牌" : "品牌"}</span>
      <span className="tc dim-text sortable" onClick={() => setSortBy("spec")}>{isActive("spec") ? "▾规格" : "规格"}</span>
      <span className="tc num sortable" onClick={() => setSortBy("quantity")}>{isActive("quantity") ? "▾数量" : "数量"}</span>
      <span className="tc num sortable" onClick={() => setSortBy("unitPrice")}>{isActive("unitPrice") ? "▾单价" : "单价"}</span>
      <span className="tc num amt">金额</span>
      <span className="tc sup sortable" onClick={() => setSortBy("supplierId")}>{isActive("supplierId") ? "▾商家" : "商家"}</span>
      <span className="tc date sortable" onClick={() => setSortBy("plannedDate")}>{isActive("plannedDate") ? "▾日期" : "日期"}</span>
    </div>
    {tasks.map(task => <TaskItem key={task.id} task={task} onRequestEdit={onRequestEdit} selected={selectedIds.has(task.id)} onToggleSelect={onToggleSelect} />)}
  </>)
}
