import type { PurchaseTask } from "../types"
import { STATUS_BADGE, STATUS_LABEL_CN } from "../types"
import { urgencyLabel } from "../helpers"

interface Props {
  task: PurchaseTask
  onRequestEdit: (id: string) => void
  selected: boolean
  onToggleSelect: (id: string) => void
}

export function TaskItem({ task, onRequestEdit, selected, onToggleSelect }: Props) {
  const amount = (task.unitPrice ?? 0) * (task.quantity ?? 0)
  return (
    <div
      className={`task-row${task.status >= 3 ? " dim" : ""}${selected ? " selected" : ""}`}
      onClick={() => onRequestEdit(task.id)}
    >
      <span className="tc cb-col" onClick={e => { e.stopPropagation(); onToggleSelect(task.id) }}>
        {selected ? "✓" : ""}
      </span>
      <span className={`tc badge badge-${task.status}`} title={STATUS_LABEL_CN[task.status]}>{STATUS_BADGE[task.status]}</span>
      <span className={`tc badge badge-u${task.urgency}`} title={`紧急${task.urgency}/5`}>{urgencyLabel(task.urgency)}</span>
      <span className="tc name">{task.name}</span>
      <span className="tc dim-text">{task.brand}</span>
      <span className="tc dim-text">{task.spec}</span>
      <span className="tc num">{task.quantity ?? 1}{task.unit}</span>
      <span className="tc num">{amount > 0 ? `${task.currency === "USD" ? "$" : task.currency === "CNY" ? "¥" : "k"}${task.unitPrice}` : ""}</span>
      <span className="tc num amt">{amount > 0 ? `${task.currency === "USD" ? "$" : task.currency === "CNY" ? "¥" : "k"}${amount.toFixed(2)}` : ""}</span>
      <span className="tc sup" title={task.supplierId}>{task.supplierId}</span>
      <span className="tc date">{task.plannedDate ? task.plannedDate.slice(5) : ""}</span>
    </div>
  )
}
