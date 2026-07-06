import { useMemo } from "react"
import { Button, ButtonGroup, HTMLSelect } from "@blueprintjs/core"
import type { TaskStatus } from "../types"
import { STATUS_BADGE } from "../types"
import { usePlanStore } from "../../../app/stores/planStore"
import { nameListOptions } from "../helpers"

/* ── Status toggle buttons ── */

const STATUS_ITEMS: TaskStatus[] = [1, 2, 3, 4, 5]

export function StatusFilter() {
  const { statusFilter, setStatusFilter } = usePlanStore()
  const toggle = (s: TaskStatus) => {
    setStatusFilter(
      statusFilter.includes(s)
        ? statusFilter.filter(x => x !== s)
        : [...statusFilter, s]
    )
  }
  return (
    <ButtonGroup variant="outlined" size="small" className="plan-filter-group">
      {STATUS_ITEMS.map(s => (
        <Button key={s} active={statusFilter.includes(s)} onClick={() => toggle(s)}>
          {STATUS_BADGE[s]}
        </Button>
      ))}
    </ButtonGroup>
  )
}

/* ── Urgency toggle buttons ── */

export function UrgencyFilter() {
  const { urgencyFilter, setUrgencyFilter } = usePlanStore()
  const toggle = (u: number) => {
    setUrgencyFilter(
      urgencyFilter.includes(u)
        ? urgencyFilter.filter(x => x !== u)
        : [...urgencyFilter, u]
    )
  }
  return (
    <ButtonGroup variant="outlined" size="small" className="plan-filter-group">
      {[1, 2, 3, 4, 5].map(u => (
        <Button key={u} active={urgencyFilter.includes(u)} onClick={() => toggle(u)}>
          {u}
        </Button>
      ))}
    </ButtonGroup>
  )
}

/* ── Supplier HTMLSelect (ControlGroup-compatible) ── */

export function SupplierFilter() {
  const { supplierFilter, setSupplierFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "supplierId"), [allTasks])

  return (
    <HTMLSelect value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} >
      <option value="">商家</option>
      {opts.map(s => <option key={s} value={s}>{s}</option>)}
    </HTMLSelect>
  )
}

/* ── Booker HTMLSelect (ControlGroup-compatible) ── */

export function BookerFilter() {
  const { bookerFilter, setBookerFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "bookerId"), [allTasks])

  return (
    <HTMLSelect value={bookerFilter} onChange={e => setBookerFilter(e.target.value)} >
      <option value="">预定人</option>
      {opts.map(s => <option key={s} value={s}>{s}</option>)}
    </HTMLSelect>
  )
}
