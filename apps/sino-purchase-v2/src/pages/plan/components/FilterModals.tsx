import { PopoverNext, Button, ButtonGroup } from "@blueprintjs/core"
import { usePlan } from "../PlanContext"
import { STATUS_BADGE, ALL_STATUSES } from "../types"
import { urgencyLabel } from "../helpers"

function StatusContent() {
  const { statusFilter, setStatusFilter } = usePlan()
  return (
    <div style={{ padding: 8, minWidth: 180 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>状态</span>
        <Button small minimal onClick={() => setStatusFilter([])}>清空</Button>
      </div>
      <ButtonGroup minimal>
        {ALL_STATUSES.map(s => (
          <Button
            key={s}
            small
            active={statusFilter.includes(s)}
            onClick={() => setStatusFilter(
              statusFilter.includes(s as never)
                ? statusFilter.filter(x => x !== s)
                : [...statusFilter, s as never]
            )}
          >
            {STATUS_BADGE[s]}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}

function UrgencyContent() {
  const { urgencyFilter, setUrgencyFilter } = usePlan()
  return (
    <div style={{ padding: 8, minWidth: 180 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>紧急度</span>
        <Button small minimal onClick={() => setUrgencyFilter([])}>清空</Button>
      </div>
      <ButtonGroup minimal>
        {[1, 2, 3, 4, 5].map(n => (
          <Button
            key={n}
            small
            active={urgencyFilter.includes(n)}
            onClick={() => setUrgencyFilter(
              urgencyFilter.includes(n)
                ? urgencyFilter.filter(x => x !== n)
                : [...urgencyFilter, n]
            )}
          >
            {urgencyLabel(n)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}

function SupplierContent() {
  const { supplierFilter, setSupplierFilter, allTasks } = usePlan()
  const opts = [...new Set(allTasks.map(t => t.supplierId).filter(Boolean))] as string[]
  return (
    <div style={{ padding: 8, minWidth: 140, maxHeight: 200, overflowY: "auto" }}>
      <Button small minimal fill active={!supplierFilter} onClick={() => setSupplierFilter("")}>
        全部
      </Button>
      {opts.map(id => (
        <Button
          key={id}
          small
          minimal
          fill
          active={supplierFilter === id}
          onClick={() => setSupplierFilter(supplierFilter === id ? "" : id)}
        >
          {id}
        </Button>
      ))}
    </div>
  )
}

function BookerContent() {
  const { bookerFilter, setBookerFilter, allTasks } = usePlan()
  const opts = [...new Set(allTasks.map(t => t.bookerId).filter(Boolean))] as string[]
  return (
    <div style={{ padding: 8, minWidth: 140, maxHeight: 200, overflowY: "auto" }}>
      <Button small minimal fill active={!bookerFilter} onClick={() => setBookerFilter("")}>
        全部
      </Button>
      {opts.map(id => (
        <Button
          key={id}
          small
          minimal
          fill
          active={bookerFilter === id}
          onClick={() => setBookerFilter(bookerFilter === id ? "" : id)}
        >
          {id}
        </Button>
      ))}
    </div>
  )
}

export function FilterPopover({ type, label, active }: { type: "status" | "urgency" | "supplier" | "booker"; label: string; active: boolean }) {
  const { showFilter, setShowFilter } = usePlan()
  const isOpen = showFilter === type
  const contentMap = {
    status: <StatusContent />,
    urgency: <UrgencyContent />,
    supplier: <SupplierContent />,
    booker: <BookerContent />,
  }
  return (
    <PopoverNext
      isOpen={isOpen}
      onInteraction={nextOpen => setShowFilter(nextOpen ? type : null)}
      content={contentMap[type]}
      placement="bottom-start"
      usePortal={false}
      arrow={false}
      renderTarget={({ ref, isOpen: _isOpen, ...targetProps }) => {
        void _isOpen
        return (
          <Button
            {...targetProps}
            ref={ref}
            small
            minimal
            className={active ? "plan-filter-btn on" : "plan-filter-btn"}
          >
            {label}
          </Button>
        )
      }}
    />
  )
}
