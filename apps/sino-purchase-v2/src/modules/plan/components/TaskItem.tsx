import {
  Icon,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  IconNames,
} from "../../../components/ui"
import {
  Menubar,
  MenuRoot,
  MenuTrigger,
  MenuPortal,
  MenuPositioner,
  MenuPopup,
  MenuCheckboxItem,
} from "../../../components/Menubar"
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

  const cls = `task-row${selected ? " selected" : ""}${isEditing ? " open" : ""}`

  const statuses: TaskStatus[] = [1, 2, 3, 4, 5]

  return (
    <Accordion
      expanded={isEditing}
      onChange={(_, expanded) => expanded ? onRequestEdit(task.id) : onCancel()}
      className={selected ? "task-acc-selected" : undefined}
    >
      <AccordionSummary
        expandIcon={<Icon icon={isEditing ? IconNames.CHEVRON_UP : IconNames.CHEVRON_DOWN} size={12} />}
      >
        <div className={cls} style={{ width: "100%" }}>
          <span onClick={e => e.stopPropagation()}>
            <Checkbox checked={selected} onChange={() => onToggleSelect(task.id)} />
          </span>
          <Menubar onClick={e => e.stopPropagation()}>
            <MenuRoot>
              <MenuTrigger style={{ background: STATUS_COLORS[task.status], color: "#fff" }} title={STATUS_LABEL_CN[task.status]}>
                {STATUS_BADGE[task.status]}
              </MenuTrigger>
              <MenuPortal>
                <MenuPositioner sideOffset={4} alignOffset={-2}>
                  <MenuPopup>
                    {statuses.map(s => (
                      <MenuCheckboxItem
                        key={s}
                        checked={task.status === s}
                        onCheckedChange={(v) => { if (v) updateTask(task.id, { status: s }) }}
                      >
                        <Box sx={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, mr: 1, border: "1px solid rgba(255,255,255,0.25)", backgroundColor: STATUS_COLORS[s] }} />
                        <span>{STATUS_BADGE[s]}</span>
                        <span style={{ opacity: 0.6, marginLeft: "auto" }}>{STATUS_LABEL_CN[s]}</span>
                      </MenuCheckboxItem>
                    ))}
                  </MenuPopup>
                </MenuPositioner>
              </MenuPortal>
            </MenuRoot>

            <MenuRoot>
              <MenuTrigger style={{ background: URGENCY_COLORS[task.urgency], color: "#fff" }} title={`紧急${task.urgency}/5`}>
                {urgencyLabel(task.urgency)}
              </MenuTrigger>
              <MenuPortal>
                <MenuPositioner sideOffset={4} alignOffset={-2}>
                  <MenuPopup>
                    {[5, 4, 3, 2, 1].map(u => (
                      <MenuCheckboxItem
                        key={u}
                        checked={task.urgency === u}
                        onCheckedChange={(v) => { if (v) updateTask(task.id, { urgency: u as 1 | 2 | 3 | 4 | 5 }) }}
                      >
                        <Box sx={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, mr: 1, border: "1px solid rgba(255,255,255,0.25)", backgroundColor: URGENCY_COLORS[u] }} />
                        <span>{urgencyLabel(u)}</span>
                        <span style={{ opacity: 0.6, marginLeft: "auto" }}>{u}/5</span>
                      </MenuCheckboxItem>
                    ))}
                  </MenuPopup>
                </MenuPositioner>
              </MenuPortal>
            </MenuRoot>
          </Menubar>
          <TaskBody task={task} />
          <span className="date">{task.plannedDate ? task.plannedDate.slice(5) : ""}</span>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <TaskDetail
          initial={task}
          mode="edit"
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      </AccordionDetails>
    </Accordion>
  )
}
