import { useState } from "react"
import { ButtonGroup, Button, Collapse, Icon, Popover, Menu, MenuItem } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import type { PurchaseTask, TaskStatus } from "../types"
import { STATUS_BADGE, STATUS_LABEL_CN, STATUS_COLORS, URGENCY_COLORS } from "../types"
import { urgencyLabel } from "../helpers"
import { usePlanStore } from "../../../app/stores/planStore"
import { TaskDetail } from "./TaskDetail"
import "../plan.css"

interface Props {
  task: PurchaseTask
  onRequestEdit: (id: string) => void
  isEditing: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  onSave: (data: Partial<PurchaseTask>) => void
  onCancel: () => void
  onDelete: () => void
}

function TaskBody({ task }: { task: PurchaseTask }) {
  const ccy = task.currency === "USD" ? "$" : task.currency === "CNY" ? "¥" : "k"
  return (
    <span className="task-body">
      <span className="n">{task.name}</span>
      {task.brand && <span>(<span className="n">{task.brand}</span>)</span>}
      {task.spec && <span>-<span className="n">{task.spec}</span></span>}
      <span> x<span className="qty">{task.quantity ?? 1}</span>{task.unit || ""}</span>
      {(task.unitPrice ?? 0) > 0 && <span> <span className="prc">{ccy}{task.unitPrice}</span></span>}
      {task.supplierId && <span> @<span className="sup">{task.supplierId}</span></span>}
      {task.bookerId && <span> #<span className="bok">{task.bookerId}</span></span>}
    </span>
  )
}

export function TaskItem({ task, onRequestEdit, isEditing, selected, onToggleSelect, onSave, onCancel, onDelete }: Props) {
  const { updateTask } = usePlanStore()
  const [statusOpen, setStatusOpen] = useState(false)
  const [urgencyOpen, setUrgencyOpen] = useState(false)

  const cls = `task-row${selected ? " selected" : ""}${isEditing ? " open" : ""}`

  const statuses: TaskStatus[] = [1, 2, 3, 4, 5]
  const statusMenu = (
    <Menu className="task-status-menu">
      {statuses.map(s => (
        <MenuItem
          key={s}
          active={task.status === s}
          text={STATUS_BADGE[s]}
          label={STATUS_LABEL_CN[s]}
          icon={<span className="task-dot" style={{ backgroundColor: STATUS_COLORS[s] }} />}
          onClick={() => { updateTask(task.id, { status: s }); setStatusOpen(false) }}
        />
      ))}
    </Menu>
  )

  const urgencyMenu = (
    <Menu className="task-urgency-menu">
      {[5, 4, 3, 2, 1].map(u => (
        <MenuItem
          key={u}
          active={task.urgency === u}
          text={urgencyLabel(u)}
          label={`${u}/5`}
          icon={<span className="task-dot" style={{ backgroundColor: URGENCY_COLORS[u] }} />}
          onClick={() => { updateTask(task.id, { urgency: u as 1 | 2 | 3 | 4 | 5 }); setUrgencyOpen(false) }}
        />
      ))}
    </Menu>
  )

  return (
    <div>
      <div className={cls} onClick={() => onRequestEdit(task.id)}>
        <span className="cb-col" onClick={e => { e.stopPropagation(); onToggleSelect(task.id) }}>
          {selected ? "✓" : ""}
        </span>
        <ButtonGroup size="small" style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <Popover
            content={statusMenu}
            placement="bottom-start"
            minimal
            isOpen={statusOpen}
            onInteraction={setStatusOpen}
          >
            <Button minimal style={{ background: STATUS_COLORS[task.status] }} title={STATUS_LABEL_CN[task.status]}>
              {STATUS_BADGE[task.status]}
            </Button>
          </Popover>
          <Popover
            content={urgencyMenu}
            placement="bottom-start"
            minimal
            isOpen={urgencyOpen}
            onInteraction={setUrgencyOpen}
          >
            <Button minimal style={{ background: URGENCY_COLORS[task.urgency] }} title={`紧急${task.urgency}/5`}>
              {urgencyLabel(task.urgency)}
            </Button>
          </Popover>
        </ButtonGroup>
        <TaskBody task={task} />
        <span className="date">{task.plannedDate ? task.plannedDate.slice(5) : ""}</span>
        <Button minimal small style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); onRequestEdit(task.id) }}>
          <Icon icon={isEditing ? IconNames.CHEVRON_UP : IconNames.CHEVRON_DOWN} size={12} />
        </Button>
      </div>
      <Collapse isOpen={isEditing} keepChildrenMounted={true}>
        <div>
          <TaskDetail
            initial={task}
            mode="edit"
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        </div>
      </Collapse>
    </div>
  )
}
