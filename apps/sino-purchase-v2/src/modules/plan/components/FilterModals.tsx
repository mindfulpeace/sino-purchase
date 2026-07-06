import { useMemo } from "react"
import { ToggleButtonGroup, ToggleButton, Select } from "../../../components/ui"
import type { TaskStatus } from "../types"
import { STATUS_BADGE } from "../types"
import { usePlanStore } from "../../../app/stores/planStore"
import { nameListOptions } from "../helpers"

/* ── Status toggle buttons (MUI ToggleButtonGroup, multiple) ── */

const STATUS_ITEMS: TaskStatus[] = [1, 2, 3, 4, 5]

export function StatusFilter() {
  const { statusFilter, setStatusFilter } = usePlanStore()
  return (
    <ToggleButtonGroup
      value={statusFilter}
      size="small"
      onChange={(v) => setStatusFilter(v as TaskStatus[])}
    >
      {STATUS_ITEMS.map(s => (
        <ToggleButton key={s} value={s}>{STATUS_BADGE[s]}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

/* ── Urgency toggle buttons (MUI ToggleButtonGroup, multiple) ── */

export function UrgencyFilter() {
  const { urgencyFilter, setUrgencyFilter } = usePlanStore()
  return (
    <ToggleButtonGroup
      value={urgencyFilter}
      size="small"
      onChange={(v) => setUrgencyFilter(v as number[])}
    >
      {[1, 2, 3, 4, 5].map(u => (
        <ToggleButton key={u} value={u}>{u}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

/* ── Supplier MUI Select ── */

export function SupplierFilter() {
  const { supplierFilter, setSupplierFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "supplierId"), [allTasks])

  return (
    <Select
      value={supplierFilter}
      placeholder="商家"
      options={opts.map(s => ({ value: s, label: s }))}
      onChange={setSupplierFilter}
    />
  )
}

/* ── Booker MUI Select ── */

export function BookerFilter() {
  const { bookerFilter, setBookerFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "bookerId"), [allTasks])

  return (
    <Select
      value={bookerFilter}
      placeholder="预定人"
      options={opts.map(s => ({ value: s, label: s }))}
      onChange={setBookerFilter}
    />
  )
}
