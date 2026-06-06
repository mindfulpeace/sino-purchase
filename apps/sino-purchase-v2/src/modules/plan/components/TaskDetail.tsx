import { useState, useMemo } from "react"
import { Button, InputGroup, NumericInput, HTMLSelect, Tag, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { BadgeToggle } from "./BadgeToggle"
import { usePlanStore } from "../../../app/stores/planStore"
import type { PurchaseTask, TaskStatus, SupportedCurrency, TaxStatus } from "../types"
import { STATUS_BADGE, TAX_STATUS_OPTIONS } from "../types"
import { nameListOptions, urgencyLabel, todayISO } from "../helpers"

interface Props {
  initial: Partial<PurchaseTask>
  mode: "add" | "edit" | "batch"
  onSave: (data: Partial<PurchaseTask>) => void
  onCancel: () => void
  onDelete?: () => void
  selectedCount?: number
}

export function TaskDetail({ initial, mode, onSave, onCancel, onDelete, selectedCount }: Props) {
  const { allTasks } = usePlanStore()
  const [d, setD] = useState<Partial<PurchaseTask>>({ ...initial })
  const [confirmDel, setConfirmDel] = useState(false)

  const supplierOpts = useMemo(() => nameListOptions(allTasks, "supplierId", d.supplierId), [allTasks, d.supplierId])
  const bookerOpts = useMemo(() => nameListOptions(allTasks, "bookerId", d.bookerId), [allTasks, d.bookerId])

  const patch = (partial: Partial<PurchaseTask>) => setD(prev => ({ ...prev, ...partial }))

  const handleStatusChange = (s: TaskStatus) => {
    if (s === 5) patch({ status: s, receivedDate: todayISO() })
    else patch({ status: s, receivedDate: d.status === 5 ? "" : d.receivedDate })
  }

  const handleSave = () => { if (mode === "batch") onSave(d); else if (d.name?.trim()) onSave(d) }
  const handleSupplierChange = (v: string) => { if (v === "__new__") { const val = prompt("输入商家名称") || ""; if (val.trim()) patch({ supplierId: val.trim() }) } else patch({ supplierId: v }) }
  const handleBookerChange = (v: string) => { if (v === "__new__") { const val = prompt("输入预定人名称") || ""; if (val.trim()) patch({ bookerId: val.trim() }) } else patch({ bookerId: v }) }

  return (
    <div className="task-detail" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 0 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        <Tag minimal>状态</Tag>
        <BadgeToggle values={[1, 2, 3, 4, 5] as TaskStatus[]} selected={d.status ?? 1} onChange={handleStatusChange} badgeClass={s => `badge-${s}`} label={s => STATUS_BADGE[s]} />
        <Tag minimal>紧急</Tag>
        <BadgeToggle values={[1, 2, 3, 4, 5]} selected={d.urgency ?? 1} onChange={n => patch({ urgency: n as 1 | 2 | 3 | 4 | 5 })} badgeClass={n => `badge-u${n}`} label={n => urgencyLabel(n)} />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <InputGroup placeholder="品名 *" value={d.name || ""} onChange={e => patch({ name: e.target.value })} style={{ flex: 1.5 }} />
        <InputGroup placeholder="品牌" value={d.brand || ""} onChange={e => patch({ brand: e.target.value })} style={{ flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <InputGroup placeholder="规格" value={d.spec || ""} onChange={e => patch({ spec: e.target.value })} style={{ flex: 1 }} />
        <NumericInput placeholder="数量" min={0} value={d.quantity ?? 1} onValueChange={v => patch({ quantity: v })} style={{ width: 70 }} />
        <InputGroup placeholder="单位" value={d.unit || ""} onChange={e => patch({ unit: e.target.value })} style={{ width: 60 }} />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        <HTMLSelect value={d.currency || "ZMW"} onChange={e => patch({ currency: e.target.value as SupportedCurrency })} style={{ width: 60 }}>
          <option value="ZMW">k</option><option value="USD">$</option><option value="CNY">¥</option>
        </HTMLSelect>
        <NumericInput placeholder="单价" min={0} step={0.01} value={d.unitPrice ?? 0} onValueChange={v => patch({ unitPrice: v })} style={{ width: 80 }} />
        <HTMLSelect value={d.taxStatus || "可抵扣"} onChange={e => patch({ taxStatus: e.target.value as TaxStatus })} style={{ width: 80 }}>
          {TAX_STATUS_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </HTMLSelect>
        <Tag minimal>@</Tag>
        <HTMLSelect value={d.supplierId || ""} onChange={e => handleSupplierChange(e.target.value)} style={{ flex: 1, minWidth: 60 }}>
          <option value="">--</option>
          {supplierOpts.map(id => <option key={id} value={id}>{id}</option>)}
          <option value="__new__">新建</option>
        </HTMLSelect>
        <Tag minimal>#</Tag>
        <HTMLSelect value={d.bookerId || ""} onChange={e => handleBookerChange(e.target.value)} style={{ flex: 1, minWidth: 60 }}>
          <option value="">--</option>
          {bookerOpts.map(id => <option key={id} value={id}>{id}</option>)}
          <option value="__new__">新建</option>
        </HTMLSelect>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Button small minimal className={d.plannedDate ? "on" : ""} onClick={() => { const v = prompt("计划日期 (YYYY-MM-DD)", d.plannedDate || todayISO()); if (v) patch({ plannedDate: v }) }}>{d.plannedDate ? d.plannedDate.slice(5) : "计划"}</Button>
        <Button small minimal className={d.receivedDate ? "on" : ""} onClick={() => { const v = prompt("入库日期 (YYYY-MM-DD)", d.receivedDate || todayISO()); if (v) patch({ receivedDate: v }) }}>{d.receivedDate ? d.receivedDate.slice(5) : "入库"}</Button>
        <Button small minimal className={d.reimbursementDate ? "on" : ""} onClick={() => { const v = prompt("报销日期 (YYYY-MM-DD)", d.reimbursementDate || todayISO()); if (v) patch({ reimbursementDate: v }) }}>{d.reimbursementDate ? d.reimbursementDate.slice(5) : "报销"}</Button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {mode === "edit" && onDelete && (<><Button small intent="danger" onClick={() => setConfirmDel(true)}><Icon icon={IconNames.TRASH} size={12} /></Button>{confirmDel && (<><Button small intent="danger" onClick={() => { onDelete(); setConfirmDel(false) }}>确认</Button><Button small minimal onClick={() => setConfirmDel(false)}>取消</Button></>)}</>)}
          {mode === "add" && <Button small intent="primary" onClick={handleSave}>添加</Button>}
          {mode === "batch" && selectedCount !== undefined && <Button small intent="primary" onClick={handleSave}>应用 ({selectedCount})</Button>}
          {(mode === "add" || mode === "batch") && <Button small minimal onClick={onCancel}>取消</Button>}
        </div>
      </div>
    </div>
  )
}
