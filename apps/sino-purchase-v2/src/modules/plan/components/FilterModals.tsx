import { useMemo } from "react"
import { Popover, Button } from "@blueprintjs/core"
import { usePlanStore } from "../../../app/stores/planStore"
import { nameListOptions } from "../helpers"

interface FilterPopoverProps {
  type: "status" | "urgency" | "supplier" | "booker"
  label: string
}

export function FilterPopover({ type, label }: FilterPopoverProps) {
  return (
    <Popover
      content={<FilterContent type={type} />}
      placement="bottom-start"
      minimal
    >
      <Button small minimal text={label} />
    </Popover>
  )
}

function FilterContent({ type }: { type: "status" | "urgency" | "supplier" | "booker" }) {
  switch (type) {
    case "status": return <StatusContent />
    case "urgency": return <UrgencyContent />
    case "supplier": return <SupplierContent />
    case "booker": return <BookerContent />
  }
}

function StatusContent() {
  const { statusFilter, setStatusFilter } = usePlanStore()
  const statuses = [1, 2, 3, 4, 5]
  const labels: Record<number, string> = { 1: "计划", 2: "预留", 3: "已收", 4: "取消", 5: "记账" }
  const toggle = (s: number) => {
    const next = statusFilter.includes(s as any) ? statusFilter.filter(x => x !== s) : [...statusFilter, s as any]
    setStatusFilter(next as any)
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 4, minWidth: 120 }}>
      {statuses.map(s => (
        <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 13, cursor: "pointer", borderRadius: 4 }}>
          <input type="checkbox" checked={statusFilter.includes(s as any)} onChange={() => toggle(s)} />
          {labels[s]} ({s})
        </label>
      ))}
    </div>
  )
}

function UrgencyContent() {
  const { urgencyFilter, setUrgencyFilter } = usePlanStore()
  const toggle = (u: number) => {
    const next = urgencyFilter.includes(u) ? urgencyFilter.filter(x => x !== u) : [...urgencyFilter, u]
    setUrgencyFilter(next)
  }
  const labels: Record<number, string> = { 1: "X 不急", 2: "2 普通", 3: "3 关注", 4: "4 加急", 5: "5 紧急" }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 4, minWidth: 120 }}>
      {[1, 2, 3, 4, 5].map(u => (
        <label key={u} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 13, cursor: "pointer", borderRadius: 4 }}>
          <input type="checkbox" checked={urgencyFilter.includes(u)} onChange={() => toggle(u)} />
          {labels[u]}
        </label>
      ))}
    </div>
  )
}

function SupplierContent() {
  const { supplierFilter, setSupplierFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "supplierId"), [allTasks])
  return opts.length === 0 ? (
    <div style={{ padding: 8, fontSize: 12, color: "var(--text-dim)" }}>无商家数据</div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 4, minWidth: 140 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 13, cursor: "pointer", borderRadius: 4 }}>
        <input type="checkbox" checked={!supplierFilter} onChange={() => setSupplierFilter("")} />
        全部
      </label>
      {opts.map(s => (
        <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 13, cursor: "pointer", borderRadius: 4 }}>
          <input type="checkbox" checked={supplierFilter === s} onChange={() => setSupplierFilter(supplierFilter === s ? "" : s)} />
          {s}
        </label>
      ))}
    </div>
  )
}

function BookerContent() {
  const { bookerFilter, setBookerFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "bookerId"), [allTasks])
  return opts.length === 0 ? (
    <div style={{ padding: 8, fontSize: 12, color: "var(--text-dim)" }}>无预定人数据</div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 4, minWidth: 140 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 13, cursor: "pointer", borderRadius: 4 }}>
        <input type="checkbox" checked={!bookerFilter} onChange={() => setBookerFilter("")} />
        全部
      </label>
      {opts.map(s => (
        <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 13, cursor: "pointer", borderRadius: 4 }}>
          <input type="checkbox" checked={bookerFilter === s} onChange={() => setBookerFilter(bookerFilter === s ? "" : s)} />
          {s}
        </label>
      ))}
    </div>
  )
}
