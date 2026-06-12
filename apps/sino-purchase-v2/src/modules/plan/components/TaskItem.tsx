import { useState, useRef, useEffect, useCallback } from "react"
import type { PurchaseTask, TaskStatus } from "../types"
import { STATUS_BADGE, STATUS_LABEL_CN } from "../types"
import { urgencyLabel } from "../helpers"
import { usePlanStore } from "../../../app/stores/planStore"
import { usePropertiesFeedback } from "@sino-purchase/desk-ui"

interface Props {
  task: PurchaseTask
  onRequestEdit: (id: string) => void
  selected: boolean
  onToggleSelect: (id: string) => void
}

/* ── Inline status selector popover ────────── */

function StatusSelector({ task, onClose }: { task: PurchaseTask; onClose: () => void }) {
  const { updateTask } = usePlanStore()
  const feedback = usePropertiesFeedback()
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
    feedback.log(`状态: ${STATUS_LABEL_CN[s]}`)
    onClose()
  }, [task.id, updateTask, feedback, onClose])

  const statuses: TaskStatus[] = [1, 2, 3, 4, 5]
  return (
    <div ref={ref} style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", gap: 2, padding: 4 }}>
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
  const feedback = usePropertiesFeedback()
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
    feedback.log(`紧急: ${u}/5`)
    onClose()
  }, [task.id, updateTask, feedback, onClose])

  return (
    <div ref={ref} style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", gap: 2, padding: 4 }}>
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

/* ── TaskItem ──────────────────────────────── */

export function TaskItem({ task, onRequestEdit, selected, onToggleSelect }: Props) {
  const [showStatus, setShowStatus] = useState(false)
  const [showUrgency, setShowUrgency] = useState(false)
  const amount = (task.unitPrice ?? 0) * (task.quantity ?? 0)

  return (
    <div className={`task-row${task.status >= 3 ? " dim" : ""}${selected ? " selected" : ""}`} onClick={() => onRequestEdit(task.id)}>
      <span className="tc cb-col" onClick={e => { e.stopPropagation(); onToggleSelect(task.id) }}>{selected ? "✓" : ""}</span>
      <span style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setShowStatus(v => !v); setShowUrgency(false) }}>
        <span className={`tc badge badge-${task.status}`} title={STATUS_LABEL_CN[task.status]}>{STATUS_BADGE[task.status]}</span>
        {showStatus && <StatusSelector task={task} onClose={() => setShowStatus(false)} />}
      </span>
      <span style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setShowUrgency(v => !v); setShowStatus(false) }}>
        <span className={`tc badge badge-u${task.urgency}`} title={`紧急${task.urgency}/5`}>{urgencyLabel(task.urgency)}</span>
        {showUrgency && <UrgencySelector task={task} onClose={() => setShowUrgency(false)} />}
      </span>
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
