import type { PurchaseTask } from "../types"
import { STATUS_BADGE } from "../types"
import { urgencyLabel } from "../helpers"
import { TaskBody } from "./TaskBody"

interface Props {
  task: PurchaseTask
  onRequestEdit: (id: string) => void
  selected: boolean
  onToggleSelect: (id: string) => void
}

export function TaskItem({ task, onRequestEdit, selected, onToggleSelect }: Props) {
  return (
    <li
      className={`task-item${task.status >= 3 ? " dim-urg" : ""}${selected ? " selected" : ""}`}
      onClick={() => onRequestEdit(task.id)}
    >
      <span className="task-badge">
        <span className={`badge badge-${task.status}`}>{STATUS_BADGE[task.status]}</span>
        <span className={`badge badge-u${task.urgency}`}>{urgencyLabel(task.urgency)}</span>
      </span>
      <TaskBody task={task} />
      <button
        className="cb"
        onClick={e => { e.stopPropagation(); onToggleSelect(task.id) }}
      >
        {selected ? "-" : " "}
      </button>
    </li>
  )
}
