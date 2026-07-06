import { useState, type CSSProperties, type MouseEvent } from "react"
import { Icon, Checkbox, Accordion, AccordionSummary, AccordionDetails, Box, IconNames } from "../../../components/ui"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
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

function TaskBody({ task, onClick }: { task: PurchaseTask; onClick?: (e: MouseEvent<HTMLSpanElement>) => void }) {
  const ccy = task.currency === "USD" ? "$" : task.currency === "CNY" ? "¥" : "k"
  return (
    <span className="task-body" onClick={onClick}>
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
  const [menu, setMenu] = useState<null | "status" | "urgency">(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const cls = `task-row${selected ? " selected" : ""}${isEditing ? " open" : ""}`
  const statuses: TaskStatus[] = [1, 2, 3, 4, 5]

  const openMenu = (which: "status" | "urgency") => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setMenu(which)
  }
  const closeMenu = () => { setMenu(null); setAnchorEl(null) }

  const triggerBtn: CSSProperties = {
    font: "inherit",
    fontSize: 12,
    lineHeight: 1.2,
    padding: "2px 0",
    width: 16,
    minWidth: 16,
    borderRadius: 0,
    border: "none",
    cursor: "pointer",
    color: "#fff",
    textAlign: "center",
  }

  return (
    <Accordion
      expanded={isEditing}
      onChange={() => {}}
      className={selected ? "task-acc-selected" : undefined}
    >
      <AccordionSummary
        expandIcon={<Icon icon={isEditing ? IconNames.CHEVRON_UP : IconNames.CHEVRON_DOWN} size={12} />}
      >
        <div className={cls} style={{ width: "100%" }}>
          <span onClick={e => e.stopPropagation()}>
            <Checkbox checked={selected} onChange={() => onToggleSelect(task.id)} />
          </span>
          <span className="task-btn-group" style={{ display: "inline-flex", borderRadius: 4, overflow: "hidden", marginRight: "0.5em" }} onClick={e => e.stopPropagation()}>
            <span role="button" tabIndex={0} style={{ ...triggerBtn, background: STATUS_COLORS[task.status] }} title={STATUS_LABEL_CN[task.status]} onClick={openMenu("status")}>
              {STATUS_BADGE[task.status]}
            </span>
            <span role="button" tabIndex={0} style={{ ...triggerBtn, background: URGENCY_COLORS[task.urgency] }} title={`紧急${task.urgency}/5`} onClick={openMenu("urgency")}>
              {urgencyLabel(task.urgency)}
            </span>
          </span>
          <Menu anchorEl={anchorEl} open={menu !== null} onClose={closeMenu} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }} sx={{ mt: 0.5 }}>
            {menu === "status" && statuses.map(s => (
              <MenuItem key={s} selected={task.status === s} onClick={() => { updateTask(task.id, { status: s }); closeMenu() }}>
                <Box sx={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, mr: 1, border: "1px solid rgba(255,255,255,0.25)", backgroundColor: STATUS_COLORS[s] }} />
                <span>{STATUS_BADGE[s]}</span>
                <span style={{ opacity: 0.6, marginLeft: "auto" }}>{STATUS_LABEL_CN[s]}</span>
              </MenuItem>
            ))}
            {menu === "urgency" && [5, 4, 3, 2, 1].map(u => (
              <MenuItem key={u} selected={task.urgency === u} onClick={() => { updateTask(task.id, { urgency: u as 1 | 2 | 3 | 4 | 5 }); closeMenu() }}>
                <Box sx={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, mr: 1, border: "1px solid rgba(255,255,255,0.25)", backgroundColor: URGENCY_COLORS[u] }} />
                <span>{urgencyLabel(u)}</span>
                <span style={{ opacity: 0.6, marginLeft: "auto" }}>{u}/5</span>
              </MenuItem>
            ))}
          </Menu>
          <TaskBody task={task} onClick={e => { e.stopPropagation(); isEditing ? onCancel() : onRequestEdit(task.id) }} />
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
