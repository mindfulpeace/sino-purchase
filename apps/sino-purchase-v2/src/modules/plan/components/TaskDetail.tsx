import { useState, useMemo, useEffect } from "react"
import { Button, InputGroup, NumericInput, Select, Tag, Icon, Alert, Text } from "../../../components/ui"
import { IconNames } from "../../../components/ui"
import { usePlanStore } from "../../../app/stores/planStore"
import type { PurchaseTask, SupportedCurrency, TaxStatus } from "../types"
import { TAX_STATUS_OPTIONS } from "../types"
import { nameListOptions } from "../helpers"

interface Props {
  initial: Partial<PurchaseTask>
  mode: "add" | "edit" | "batch"
  onSave: (data: Partial<PurchaseTask>) => void
  onCancel: () => void
  onDelete?: () => void
  selectedCount?: number
  readOnly?: boolean
}

export function TaskDetail({ initial, mode, onSave, onCancel, onDelete, selectedCount, readOnly }: Props) {
  const { allTasks } = usePlanStore()
  const [d, setD] = useState<Partial<PurchaseTask>>({ ...initial })
  const [confirmDel, setConfirmDel] = useState(false)
  // Sync when switching tasks
  useEffect(() => { setD({ ...initial }); setConfirmDel(false) }, [initial.name, initial.id])

  const supplierOpts = useMemo(() => nameListOptions(allTasks, "supplierId", d.supplierId), [allTasks, d.supplierId])
  const bookerOpts = useMemo(() => nameListOptions(allTasks, "bookerId", d.bookerId), [allTasks, d.bookerId])

  const patch = (partial: Partial<PurchaseTask>) => setD(prev => ({ ...prev, ...partial }))

  const handleSave = () => { if (mode === "batch") onSave(d); else if (d.name?.trim()) onSave(d) }
  const handleSupplierCreate = () => { const val = prompt("输入商家名称"); if (val && val.trim()) patch({ supplierId: val.trim() }) }
  const handleBookerCreate = () => { const val = prompt("输入预定人名称"); if (val && val.trim()) patch({ bookerId: val.trim() }) }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 0 12px" }}>
      {readOnly && <Text style={{ fontSize: 11, textAlign: "center", padding: "2px 0", color: "var(--text-dim)" }}>只读 — 再次点击切换编辑</Text>}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <InputGroup placeholder="品名 *" value={d.name || ""} onChange={e => patch({ name: e.target.value })} style={{ flex: 1.5 }} readOnly={readOnly} />
        <InputGroup placeholder="品牌" value={d.brand || ""} onChange={e => patch({ brand: e.target.value })} style={{ flex: 1 }} readOnly={readOnly} />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <InputGroup placeholder="规格" value={d.spec || ""} onChange={e => patch({ spec: e.target.value })} style={{ flex: 1 }} readOnly={readOnly} />
        <NumericInput placeholder="数量" min={0} value={d.quantity ?? 1} onValueChange={v => patch({ quantity: v })} style={{ width: 70 }} disabled={readOnly} />
        <InputGroup placeholder="单位" value={d.unit || ""} onChange={e => patch({ unit: e.target.value })} style={{ width: 60 }} readOnly={readOnly} />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        <Select value={d.currency || "ZMW"} options={[{ value: "ZMW", label: "k" }, { value: "USD", label: "$" }, { value: "CNY", label: "¥" }]} onChange={v => patch({ currency: v as SupportedCurrency })} disabled={readOnly} style={{ width: 60 }} />
        <NumericInput placeholder="单价" min={0} step={0.01} value={d.unitPrice ?? 0} onValueChange={v => patch({ unitPrice: v })} style={{ width: 80 }} disabled={readOnly} />
        <Select value={d.taxStatus || "可抵扣"} options={TAX_STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label }))} onChange={v => patch({ taxStatus: v as TaxStatus })} disabled={readOnly} style={{ width: 80 }} />
        <Tag minimal>@</Tag>
        <Select value={d.supplierId || ""} placeholder="--" options={supplierOpts.map(id => ({ value: id, label: id }))} allowCreate onCreate={handleSupplierCreate} onChange={v => patch({ supplierId: v })} disabled={readOnly} style={{ flex: 1, minWidth: 60 }} />
        <Tag minimal>#</Tag>
        <Select value={d.bookerId || ""} placeholder="--" options={bookerOpts.map(id => ({ value: id, label: id }))} allowCreate onCreate={handleBookerCreate} onChange={v => patch({ bookerId: v })} disabled={readOnly} style={{ flex: 1, minWidth: 60 }} />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <InputGroup type="date" value={d.plannedDate || ""} onChange={e => patch({ plannedDate: e.target.value })} disabled={readOnly} style={{ width: 90 }} />
        <InputGroup type="date" value={d.receivedDate || ""} onChange={e => patch({ receivedDate: e.target.value })} disabled={readOnly} style={{ width: 90 }} />
        <InputGroup type="date" value={d.reimbursementDate || ""} onChange={e => patch({ reimbursementDate: e.target.value })} disabled={readOnly} style={{ width: 90 }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {!readOnly && mode === "edit" && onDelete && (<><Button small intent="danger" onClick={() => setConfirmDel(true)}><Icon icon={IconNames.TRASH} size={12} /></Button><Alert isOpen={confirmDel} onClose={() => setConfirmDel(false)} cancelButtonText="取消" confirmButtonText="确认" intent="danger" canEscapeKeyCancel canOutsideClickCancel onConfirm={() => { onDelete(); setConfirmDel(false) }}>确认删除？</Alert></>)}
          {!readOnly && mode === "add" && <Button small intent="primary" onClick={handleSave}>添加</Button>}
          {!readOnly && mode === "batch" && selectedCount !== undefined && <Button small intent="primary" onClick={handleSave}>应用 ({selectedCount})</Button>}
          {!readOnly && (mode === "add" || mode === "batch") && <Button small minimal onClick={onCancel}>取消</Button>}
        </div>
      </div>
    </div>
  )
}
