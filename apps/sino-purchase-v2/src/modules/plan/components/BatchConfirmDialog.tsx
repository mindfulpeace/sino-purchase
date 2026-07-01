import { Dialog, Button, Text } from "@blueprintjs/core"
import type { PurchaseTask } from "../types"
import { STATUS_BADGE } from "../types"
import { currencySymbol } from "../types"
import "../plan.css"

interface Props { isOpen: boolean; changes: Partial<PurchaseTask>; count: number; onConfirm: () => void; onClose: () => void }

function fmt(label: string, val: unknown): string {
  if (val === undefined || val === null || val === "") return ""
  if (label === "status") return `状态=${STATUS_BADGE[val as number]}`
  if (label === "currency") return `币种=${currencySymbol(val as "ZMW" | "USD" | "CNY")}`
  if (typeof val === "number") return `${label}=${val}`
  return `${label}=${val}`
}

export function BatchConfirmDialog({ isOpen, changes, count, onConfirm, onClose }: Props) {
  const entries = Object.entries(changes).filter(([, v]) => v !== undefined && v !== null && v !== "")
  if (!entries.length) return null
  return (<Dialog isOpen={isOpen} onClose={onClose} title="批量修改" style={{ width: 320 }}>
    <div className="col-gap" style={{ padding: 12 }}>
      {entries.map(([k, v]) => (<Text key={k} className="dim">{fmt(k, v)}</Text>))}
      <Text style={{ fontWeight: 600 }}>影响 {count} 项任务</Text>
      <div className="flex-end" style={{ marginTop: 8 }}>
        <Button minimal onClick={onClose}>取消</Button>
        <Button intent="primary" onClick={onConfirm}>确认</Button>
      </div>
    </div>
  </Dialog>)
}
