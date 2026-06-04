import { Dialog, Button } from "@blueprintjs/core"
import type { PurchaseTask } from "../types"
import { STATUS_BADGE } from "../types"
import { currencySymbol } from "../types"

interface Props {
  isOpen: boolean
  changes: Partial<PurchaseTask>
  count: number
  onConfirm: () => void
  onClose: () => void
}

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

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="批量修改" style={{ width: 320 }}>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map(([k, v]) => (
          <p key={k} style={{ margin: 0, fontSize: 13, color: "var(--text-dim)" }}>{fmt(k, v)}</p>
        ))}
        <p style={{ margin: 0, fontWeight: 600 }}>影响 {count} 项任务</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 8 }}>
          <Button minimal onClick={onClose}>取消</Button>
          <Button intent="primary" onClick={onConfirm}>确认</Button>
        </div>
      </div>
    </Dialog>
  )
}
