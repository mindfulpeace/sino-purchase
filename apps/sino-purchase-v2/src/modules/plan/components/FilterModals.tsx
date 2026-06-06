import { useMemo } from "react"
import { usePlanStore } from "../../../app/stores/planStore"
import { nameListOptions } from "../helpers"

export function FilterPopover() {
  const { showFilter, setShowFilter } = usePlanStore()
  if (!showFilter) return null
  return (<>
    <div className="filter-overlay" onClick={() => setShowFilter(null)} />
    <div className="filter-panel">
      {showFilter === "status" && <StatusContent />}
      {showFilter === "urgency" && <UrgencyContent />}
      {showFilter === "supplier" && <SupplierContent />}
      {showFilter === "booker" && <BookerContent />}
    </div>
  </>)
}

function StatusContent() {
  const { statusFilter, setStatusFilter } = usePlanStore()
  const statuses = [1, 2, 3, 4, 5]
  const labels = { 1: "计划", 2: "预留", 3: "已收", 4: "取消", 5: "记账" }
  const toggle = (s: number) => { const next = statusFilter.includes(s as any) ? statusFilter.filter(x => x !== s) : [...statusFilter, s as any]; setStatusFilter(next as any) }
  return (<div className="filter-group">{statuses.map(s => (<label key={s} className="filter-option"><input type="checkbox" checked={statusFilter.includes(s as any)} onChange={() => toggle(s)} />{labels[s as keyof typeof labels]} ({s})</label>))}</div>)
}

function UrgencyContent() {
  const { urgencyFilter, setUrgencyFilter } = usePlanStore()
  const toggle = (u: number) => { const next = urgencyFilter.includes(u) ? urgencyFilter.filter(x => x !== u) : [...urgencyFilter, u]; setUrgencyFilter(next) }
  const labels: Record<number, string> = { 1: "X 不急", 2: "2 普通", 3: "3 关注", 4: "4 加急", 5: "5 紧急" }
  return (<div className="filter-group">{[1, 2, 3, 4, 5].map(u => (<label key={u} className="filter-option"><input type="checkbox" checked={urgencyFilter.includes(u)} onChange={() => toggle(u)} />{labels[u]}</label>))}</div>)
}

function SupplierContent() {
  const { supplierFilter, setSupplierFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "supplierId"), [allTasks])
  return (opts.length === 0 ? <div className="filter-group"><span>无商家数据</span></div> : <div className="filter-group"><label className="filter-option"><input type="checkbox" checked={!supplierFilter} onChange={() => setSupplierFilter("")} />全部</label>{opts.map(s => (<label key={s} className="filter-option"><input type="checkbox" checked={supplierFilter === s} onChange={() => setSupplierFilter(supplierFilter === s ? "" : s)} />{s}</label>))}</div>)
}

function BookerContent() {
  const { bookerFilter, setBookerFilter, allTasks } = usePlanStore()
  const opts = useMemo(() => nameListOptions(allTasks, "bookerId"), [allTasks])
  return (opts.length === 0 ? <div className="filter-group"><span>无预定人数据</span></div> : <div className="filter-group"><label className="filter-option"><input type="checkbox" checked={!bookerFilter} onChange={() => setBookerFilter("")} />全部</label>{opts.map(s => (<label key={s} className="filter-option"><input type="checkbox" checked={bookerFilter === s} onChange={() => setBookerFilter(bookerFilter === s ? "" : s)} />{s}</label>))}</div>)
}
