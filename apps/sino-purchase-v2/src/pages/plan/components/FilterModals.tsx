import { Dialog, Button, ButtonGroup } from "@blueprintjs/core"
import { usePlan } from "../PlanContext"
import { STATUS_BADGE, STATUS_LABEL_CN, ALL_STATUSES } from "../types"
import { nameListOptions, urgencyLabel } from "../helpers"

export function FilterModals() {
  const {
    showFilter, setShowFilter,
    statusFilter, setStatusFilter,
    urgencyFilter, setUrgencyFilter,
    supplierFilter, setSupplierFilter,
    bookerFilter, setBookerFilter,
    allTasks,
  } = usePlan()

  const toggleStatus = (s: number) =>
    setStatusFilter(statusFilter.includes(s as never) ? statusFilter.filter(x => x !== s) : [...statusFilter, s as never])
  const toggleUrgency = (n: number) =>
    setUrgencyFilter(urgencyFilter.includes(n) ? urgencyFilter.filter(x => x !== n) : [...urgencyFilter, n])

  const supplierOptions = nameListOptions(allTasks, "supplierId")
  const bookerOptions = nameListOptions(allTasks, "bookerId")

  return (
    <>
      <Dialog
        isOpen={showFilter === "status"}
        onClose={() => setShowFilter(null)}
        title="状态筛选"
        style={{ width: 300 }}
      >
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <Button small minimal onClick={() => setStatusFilter([])}>清空</Button>
          <ButtonGroup minimal>
            {ALL_STATUSES.map(s => (
              <Button
                key={s}
                small
                active={statusFilter.includes(s)}
                onClick={() => toggleStatus(s)}
              >
                {STATUS_BADGE[s]} {STATUS_LABEL_CN[s]}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </Dialog>

      <Dialog
        isOpen={showFilter === "urgency"}
        onClose={() => setShowFilter(null)}
        title="紧急度筛选"
        style={{ width: 300 }}
      >
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <Button small minimal onClick={() => setUrgencyFilter([])}>清空</Button>
          <ButtonGroup minimal>
            {[1, 2, 3, 4, 5].map(n => (
              <Button
                key={n}
                small
                active={urgencyFilter.includes(n)}
                onClick={() => toggleUrgency(n)}
              >
                {urgencyLabel(n)}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </Dialog>

      <Dialog
        isOpen={showFilter === "supplier"}
        onClose={() => setShowFilter(null)}
        title="商家筛选"
        style={{ width: 300 }}
      >
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          <Button small minimal active={!supplierFilter} onClick={() => setSupplierFilter("")}>全部</Button>
          {supplierOptions.map(id => (
            <Button
              key={id}
              small
              minimal
              active={supplierFilter === id}
              onClick={() => setSupplierFilter(supplierFilter === id ? "" : id)}
            >
              {id}
            </Button>
          ))}
        </div>
      </Dialog>

      <Dialog
        isOpen={showFilter === "booker"}
        onClose={() => setShowFilter(null)}
        title="预定人筛选"
        style={{ width: 300 }}
      >
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          <Button small minimal active={!bookerFilter} onClick={() => setBookerFilter("")}>全部</Button>
          {bookerOptions.map(id => (
            <Button
              key={id}
              small
              minimal
              active={bookerFilter === id}
              onClick={() => setBookerFilter(bookerFilter === id ? "" : id)}
            >
              {id}
            </Button>
          ))}
        </div>
      </Dialog>
    </>
  )
}
