import { useState, useRef, useEffect, useCallback } from "react"
import type { PurchaseTask, TaskStatus } from "../types"
import { STATUS_BADGE, STATUS_LABEL_CN } from "../types"
import { urgencyLabel } from "../helpers"
import { usePlanStore } from "../../../app/stores/planStore"
import { useDock } from "@sino-purchase/ui-dock"
import { TaskDetail } from "./TaskDetail"

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

/* ── Inline status selector popover ────────── */

function StatusSelector({ task, onClose }: { task: PurchaseTask; onClose: () => void }) {
  const { updateTask } = usePlanStore()
  const { setStatus } = useDock()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  const handleSelect = useCallback((s: TaskStatus) => {
    updateTask(task.id, { status: s })
    setStatus(`状态: ${STATUS_LABEL_CN[s]}`)
    onClose()
  }, [task.id, updateTask, setStatus, onClose])

  const statuses: TaskStatus[] = [1, 2, 3, 4, 5]
  return (
    <div ref={ref} style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "var(--dv-tabs-and-actions-container-background-color, #1c1c2a)", border: "1px solid var(--dv-separator-border, #2b2b4a)", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", display: "flex", gap: 2, padding: 4 }}>
      {statuses.map(s => (
        <button
          key={s}
          className={`badge badge-${s}${task.status === s ? " on" : ""}`}
          onClick={() => handleSelect(s)}
          title={STATUS_LABEL_CN[s]}
          style={{ width: 22, height: 22, fontSize: 11, cursor: "pointer", border: "none" }}
        >
          {STATUS_BADGE[s]}
        </button>
      ))}
    </div>
  )
}

/* ── Inline urgency selector popover ───────── */

function UrgencySelector({ task, onClose }: { task: PurchaseTask; onClose: () => void }) {
  const { updateTask } = usePlanStore()
  const { setStatus } = useDock()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  const handleSelect = useCallback((u: number) => {
    updateTask(task.id, { urgency: u as 1 | 2 | 3 | 4 | 5 })
    setStatus(`紧急: ${u}/5`)
    onClose()
  }, [task.id, updateTask, setStatus, onClose])

  return (
    <div ref={ref} style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "var(--dv-tabs-and-actions-container-background-color, #1c1c2a)", border: "1px solid var(--dv-separator-border, #2b2b4a)", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", display: "flex", gap: 2, padding: 4 }}>
      {[1, 2, 3, 4, 5].map(u => (
        <button
          key={u}
          className={`badge badge-u${u}${task.urgency === u ? " on" : ""}`}
          onClick={() => handleSelect(u)}
          title={`紧急${u}/5`}
          style={{ width: 22, height: 22, fontSize: 11, cursor: "pointer", border: "none" }}
        >
          {urgencyLabel(u)}
        </button>
      ))}
    </div>
  )
}

/* ── Task body text ─────────────────────────── */

function TaskBody({ task }: { task: PurchaseTask }) {
  const ccy = task.currency === "USD" ? "$" : task.currency === "CNY" ? "¥" : "k"
  return (
    <span className="task-body">
      <span className="n">{task.name}</span>
      {task.brand && <span>(<span className="v">{task.brand}</span>)</span>}
      {task.spec && <span>-<span className="v">{task.spec}</span></span>}
      <span> x<span className="qty">{task.quantity ?? 1}</span>{task.unit || ""}</span>
      {(task.unitPrice ?? 0) > 0 && <span> <span className="prc">{ccy}{task.unitPrice}</span></span>}
      {task.supplierId && <span> @<span className="sup">{task.supplierId}</span></span>}
      {task.bookerId && <span> #<span className="bok">{task.bookerId}</span></span>}
    </span>
  )
}

/* ── TaskItem ───────────────────────────────── */

export function TaskItem({ task, onRequestEdit, isEditing, selected, onToggleSelect, onSave, onCancel, onDelete }: Props) {
  const [showStatus, setShowStatus] = useState(false)
  const [showUrgency, setShowUrgency] = useState(false)

  return (
    <div
      className={`task-row${task.status >= 3 ? " dim" : ""}${selected ? " selected" : ""}${isEditing ? " open" : ""}`}
      onClick={() => onRequestEdit(task.id)}
    >
      <span className="tc cb-col" onClick={e => { e.stopPropagation(); onToggleSelect(task.id) }}>
        {selected ? "✓" : ""}
      </span>
      <span style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setShowStatus(v => !v); setShowUrgency(false) }}>
        <span className={`tc badge badge-${task.status}`} title={STATUS_LABEL_CN[task.status]}>{STATUS_BADGE[task.status]}</span>
        {showStatus && <StatusSelector task={task} onClose={() => setShowStatus(false)} />}
      </span>
      <span style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setShowUrgency(v => !v); setShowStatus(false) }}>
        <span className={`tc badge badge-u${task.urgency}`} title={`紧急${task.urgency}/5`}>{urgencyLabel(task.urgency)}</span>
        {showUrgency && <UrgencySelector task={task} onClose={() => setShowUrgency(false)} />}
      </span>
      <TaskBody task={task} />
      <span className="tc date">{task.plannedDate ? task.plannedDate.slice(5) : ""}</span>

      {isEditing && (
        <div style={{ width: "100%" }}>
          <TaskDetail
            initial={task}
            mode="edit"
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}
