import { useState, useMemo, useEffect, useRef } from "react"
import { Button, InputGroup, NumericInput, Select, Alert, Text, Box, ToggleButtonGroup, ToggleButton } from "../../../components/ui"
import DeleteIcon from "@mui/icons-material/Delete"
import CloseIcon from "@mui/icons-material/Close"
import { usePlanData } from "../../../app/stores/PlanDataContext"
import type { PurchaseTask, SupportedCurrency, TaxStatus, TaskStatus, Urgency } from "../types"
import { TAX_STATUS_OPTIONS, ALL_STATUSES, STATUS_LABEL_CN } from "../types"
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
  const { tasks: allTasks } = usePlanData()
  const [d, setD] = useState<Partial<PurchaseTask>>({ ...initial })
  const [confirmDel, setConfirmDel] = useState(false)
  // 始终持有最新草稿，供折叠时提交
  const draftRef = useRef(d)
  const onSaveRef = useRef(onSave)
  const deletedRef = useRef(false)
  const discardRef = useRef(false)
  useEffect(() => { draftRef.current = d }, [d])
  useEffect(() => { onSaveRef.current = onSave }, [onSave])
  // Sync when switching tasks
  useEffect(() => { setD({ ...initial }); setConfirmDel(false); deletedRef.current = false; discardRef.current = false }, [initial.name, initial.id])

  // 卸载时（折叠 / 切到别的任务 / 直接关）自动保存草稿。
  // 用 effect cleanup 而非父组件调用，确保保存发生在 TaskDetail 还挂载、草稿最新时，
  // 避免条件渲染卸载后父组件 useEffect 读取已失效 ref 的时序问题。
  useEffect(() => {
    return () => {
      if (deletedRef.current || discardRef.current || mode !== "edit") return
      const cur = draftRef.current
      if (!cur.name?.trim()) return
      const changed = (Object.keys(cur) as (keyof PurchaseTask)[]).some(k => cur[k] !== (initial as Record<string, unknown>)[k])
      if (changed) onSaveRef.current({ ...cur, id: (initial as Record<string, unknown>).id } as Partial<PurchaseTask>)
    }
  }, [mode, initial])

  const supplierOpts = useMemo(() => nameListOptions(allTasks, "supplierId", d.supplierId), [allTasks, d.supplierId])
  const bookerOpts = useMemo(() => nameListOptions(allTasks, "bookerId", d.bookerId), [allTasks, d.bookerId])

  const patch = (partial: Partial<PurchaseTask>) => setD(prev => ({ ...prev, ...partial }))

  // 多选编辑：是否有改动（无改动时应用按钮禁用）
  const batchDirty = useMemo(() => {
    if (mode !== "batch") return false
    const a = d as Record<string, unknown>
    const b = initial as Record<string, unknown>
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const k of keys) if (a[k] !== b[k]) return true
    return false
  }, [d, initial, mode])

  const handleSave = () => { if (mode === "batch") onSave(d); else if (d.name?.trim()) onSave(d) }
  const handleSupplierCreate = () => { const val = prompt("输入商家名称"); if (val && val.trim()) patch({ supplierId: val.trim() }) }
  const handleBookerCreate = () => { const val = prompt("输入预定人名称"); if (val && val.trim()) patch({ bookerId: val.trim() }) }
  const handleDelete = () => { deletedRef.current = true; onDelete?.() }

  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 0 8px" }}>
      {readOnly && <Text style={{ fontSize: 11, textAlign: "center", padding: "2px 0", color: "var(--text-dim)" }}>只读 — 再次点击切换编辑</Text>}
      {/* 多选编辑：状态 / 紧急（样式同筛选栏的 UI ToggleButtonGroup） */}
      {mode === "batch" && (
        <Box style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
          <Box style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Text style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>状态</Text>
            <ToggleButtonGroup
              exclusive
              value={d.status ?? null}
              onChange={(v) => { if (v != null) patch({ status: v as TaskStatus }) }}
            >
              {ALL_STATUSES.map(s => (
                <ToggleButton key={s} value={s}>{STATUS_LABEL_CN[s]}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Box style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Text style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>紧急</Text>
            <ToggleButtonGroup
              exclusive
              value={d.urgency ?? null}
              onChange={(v) => { if (v != null) patch({ urgency: v as Urgency }) }}
            >
              {[1, 2, 3, 4, 5].map(u => (
                <ToggleButton key={u} value={u} title={`紧急 ${u}/5`}>{u}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>
      )}
      {/* Row 1: 物品与价格 */}
      <Box style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <InputGroup id="name" label="品名 *" variant="standard" value={d.name || ""} onChange={e => patch({ name: e.target.value })} style={{ flex: 4, minWidth: 120 }} readOnly={readOnly} />
        <InputGroup id="brand" label="品牌" variant="standard" value={d.brand || ""} onChange={e => patch({ brand: e.target.value })} style={{ flex: 1, minWidth: 54 }} readOnly={readOnly} />
        <InputGroup id="spec" label="规格" variant="standard" value={d.spec || ""} onChange={e => patch({ spec: e.target.value })} style={{ flex: 2.5, minWidth: 92 }} readOnly={readOnly} />
        <NumericInput id="qty" label="数量" variant="standard" min={0} value={d.quantity ?? 1} onValueChange={v => patch({ quantity: v })} style={{ width: 48 }} disabled={readOnly} />
        <InputGroup id="unit" label="单位" variant="standard" value={d.unit || ""} onChange={e => patch({ unit: e.target.value })} style={{ width: 44 }} readOnly={readOnly} />
        <Select id="currency" label="货币" variant="standard" value={d.currency || "ZMW"} options={[{ value: "ZMW", label: "k" }, { value: "USD", label: "$" }, { value: "CNY", label: "¥" }]} onChange={v => patch({ currency: v as SupportedCurrency })} disabled={readOnly} style={{ width: 56 }} />
        <NumericInput id="price" label="单价" variant="standard" min={0} step={0.01} value={d.unitPrice ?? 0} onValueChange={v => patch({ unitPrice: v })} style={{ width: 62 }} disabled={readOnly} />
        <Select id="tax" label="税状态" variant="standard" value={d.taxStatus || "可抵扣"} options={TAX_STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label }))} onChange={v => patch({ taxStatus: v as TaxStatus })} disabled={readOnly} style={{ width: 76 }} />
      </Box>
      {/* Row 2: 关联方 / 日期 / 操作 */}
      <Box style={{ display: "flex", gap: "8px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <Select id="supplier" label="商家" variant="standard" value={d.supplierId || ""} placeholder="--" options={supplierOpts.map(id => ({ value: id, label: id }))} allowCreate onCreate={handleSupplierCreate} onChange={v => patch({ supplierId: v })} disabled={readOnly} style={{ flex: 1, minWidth: 70 }} />
        <Select id="booker" label="预定人" variant="standard" value={d.bookerId || ""} placeholder="--" options={bookerOpts.map(id => ({ value: id, label: id }))} allowCreate onCreate={handleBookerCreate} onChange={v => patch({ bookerId: v })} disabled={readOnly} style={{ flex: 1, minWidth: 70 }} />
        <InputGroup id="plannedDate" label="计划日期" variant="standard" type="date" value={d.plannedDate || ""} onChange={e => patch({ plannedDate: e.target.value })} disabled={readOnly} style={{ width: 116, flexShrink: 0 }} />
        <InputGroup id="receivedDate" label="收货日期" variant="standard" type="date" value={d.receivedDate || ""} onChange={e => patch({ receivedDate: e.target.value })} disabled={readOnly} style={{ width: 116, flexShrink: 0 }} />
        <InputGroup id="reimbDate" label="报销日期" variant="standard" type="date" value={d.reimbursementDate || ""} onChange={e => patch({ reimbursementDate: e.target.value })} disabled={readOnly} style={{ width: 116, flexShrink: 0 }} />
        <Box style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "flex-end" }}>
          {!readOnly && mode === "add" && <Button small intent="primary" onClick={handleSave}>添加</Button>}
          {!readOnly && mode === "batch" && selectedCount !== undefined && (
            <Button small variant="contained" intent="success" disabled={!batchDirty} onClick={handleSave}>应用 ({selectedCount})</Button>
          )}
          {!readOnly && onDelete && (
            <>
              <Button small intent="danger" variant="contained" title="删除" onClick={() => setConfirmDel(true)} style={{ minWidth: 28, padding: "2px 4px" }}>
                <DeleteIcon style={{ fontSize: 15 }} />
              </Button>
              <Alert
                isOpen={confirmDel}
                onClose={() => setConfirmDel(false)}
                cancelButtonText="取消"
                confirmButtonText="确认"
                intent="danger"
                canEscapeKeyCancel
                canOutsideClickCancel
                onConfirm={() => { handleDelete(); setConfirmDel(false) }}
              >
                {mode === "batch"
                  ? `确认删除选中的 ${selectedCount ?? 0} 个任务？此操作不可撤销。`
                  : "确认删除该任务？此操作不可撤销。"}
              </Alert>
            </>
          )}
          {/* 取消 / 放弃保存：窄图标按钮（仅 add 模式；batch 模式详情随选中自动出现，收起由「取消选择/应用/删除」负责） */}
          {!readOnly && mode === "add" && (
            <Button small variant="outlined" title="取消" onClick={onCancel} style={{ minWidth: 28, padding: "2px 4px", color: "var(--text-dim, #858585)", borderColor: "var(--border, #3a3a5a)" }}>
              <CloseIcon style={{ fontSize: 15 }} />
            </Button>
          )}
          {!readOnly && mode === "edit" && (
            <Button small variant="outlined" title="放弃保存" onClick={() => { discardRef.current = true; onCancel() }} style={{ minWidth: 28, padding: "2px 4px", color: "var(--text-dim, #858585)", borderColor: "var(--border, #3a3a5a)" }}>
              <CloseIcon style={{ fontSize: 15 }} />
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
