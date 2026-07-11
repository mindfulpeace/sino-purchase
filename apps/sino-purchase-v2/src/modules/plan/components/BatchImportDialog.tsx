import { useState, useEffect } from "react"
import { Dialog, Button, TextArea, Text, Card, DialogActions, Stack, Box } from "../../../components/ui"
import type { PurchaseTask, SupportedCurrency, TaskStatus, Urgency } from "../types"
import { defaultTaskFields } from "../helpers"

function PreviewTask({ task }: { task: Partial<PurchaseTask> }) {
  return (<Box style={{ fontSize: 12, padding: "2px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: "4px" }}>
    <Text style={{ fontWeight: 600, margin: 0 }}>{task.name}</Text>
    {task.brand && <Text style={{ color: "var(--text-dim)", margin: 0 }}>({task.brand})</Text>}
    {task.spec && <Text style={{ color: "var(--text-dim)", margin: 0 }}>-{task.spec}</Text>}
    <Text style={{ margin: 0 }}> x{task.quantity ?? 1}{task.unit || ""}</Text>
  </Box>)
}

interface Props { isOpen: boolean; onClose: () => void; onImport: (tasks: Partial<PurchaseTask>[]) => void }

const COLUMN_MAP: [RegExp, keyof PurchaseTask | null][] = [
  [/名称|品名|name/i, "name"], [/品牌|brand/i, "brand"], [/型号|规格|model|spec|specification/i, "spec"],
  [/单位|unit/i, "unit"], [/数量|qty|quantity/i, "quantity"], [/单价|价格|unit.?price|price/i, "unitPrice"],
  [/币种|货币|currency/i, "currency"], [/汇率|rate|exchange.?rate/i, "exchangeRate"],
  [/商家|供应商|supplier/i, "supplierId"], [/预定[人者]|booker|申请人/i, "bookerId"],
  [/状态|status/i, "status"], [/紧急|urgency/i, "urgency"], [/日期|date/i, "plannedDate"],
  [/含税|税率|tax/i, "taxStatus"], [/用途|备注|note|purpose/i, null],
]

function detectColumn(headers: string[]): (keyof PurchaseTask | null)[] {
  return headers.map(h => { for (const [re, field] of COLUMN_MAP) { if (re.test(h.trim())) return field } return null })
}

function parseValue(val: string, field: keyof PurchaseTask | null): string | number {
  if (!field) return ""
  const v = val.trim()
  if (field === "quantity" || field === "unitPrice" || field === "exchangeRate") { const n = parseFloat(v.replace(/[^0-9.]/g, "")); return isNaN(n) ? (field === "quantity" ? 1 : 0) : n }
  if (field === "status" || field === "urgency") { const n = parseInt(v, 10); if (!isNaN(n) && n >= 1 && n <= 5) return n as TaskStatus | Urgency; return field === "status" ? 1 : 2 }
  if (field === "currency") { const c = v.toUpperCase(); if (c === "ZMW" || c === "USD" || c === "CNY") return c as SupportedCurrency; if (c === "K") return "ZMW"; if (c === "$" || c === "US$") return "USD"; if (c === "¥" || c === "RMB") return "CNY"; return "ZMW" }
  return v
}

export function BatchImportDialog({ isOpen, onClose, onImport }: Props) {
  const [input, setInput] = useState("")
  const [parsed, setParsed] = useState<Partial<PurchaseTask>[]>([])

  useEffect(() => { if (!isOpen) return; navigator.clipboard.readText().then(v => { if (v) handleInput(v) }).catch(() => {}) }, [isOpen])

  function handleInput(v: string) {
    setInput(v)
    const lines = v.split("\n").map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) { setParsed([]); return }
    const headers = lines[0].split("\t").map(h => h.trim())
    const mapping = detectColumn(headers)
    const nameIdx = mapping.findIndex(f => f === "name")
    if (nameIdx === -1) { setParsed([]); return }
    const tasks: Partial<PurchaseTask>[] = []
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split("\t").map(c => c.trim())
      if (cells.length <= nameIdx || !cells[nameIdx]) continue
      // 先套用默认值（status/urgency 等），再用解析到的列覆盖，避免缺字段被默认筛选器过滤掉
      const task: Record<string, unknown> = { ...defaultTaskFields() }
      for (let j = 0; j < mapping.length; j++) { const field = mapping[j]; if (!field) continue; if (j < cells.length && cells[j]) task[field] = parseValue(cells[j], field) }
      tasks.push(task as Partial<PurchaseTask>)
    }
    setParsed(tasks)
  }

  function handleImport() { if (parsed.length === 0) return; onImport(parsed); setInput(""); setParsed([]); onClose() }
  function handleClose() { setInput(""); setParsed([]); onClose() }

  return (<Dialog isOpen={isOpen} onClose={handleClose} title="批量导入" style={{ width: 480 }}>
    <Stack spacing={1} sx={{ p: 1.5 }}>
      <Text style={{ color: "var(--text-dim)" }}>从 Google Sheets 或 Excel 复制数据粘贴到下方。表头会自动识别列对应关系。</Text>
      <TextArea large value={input} onChange={e => handleInput(e.target.value)} placeholder="名称\t品牌\t型号\t单位\t数量\t用途\t申请人\n油漆\t\t灰色\t桶\t4\t\t备货\n..." rows={6} style={{ width: "100%", fontFamily: "monospace" }} />
      {parsed.length > 0 && (<>
        <Text style={{ color: "var(--text-dim)" }}>已解析 <strong>{parsed.length}</strong> 条任务</Text>
        <Card style={{ maxHeight: 150, overflowY: "auto", padding: 4 }}>{parsed.map((t, i) => <PreviewTask key={i} task={t} />)}</Card>
      </>)}
      <DialogActions>
        <Button minimal onClick={handleClose}>取消</Button>
        <Button intent="primary" onClick={handleImport} disabled={parsed.length === 0}>导入 ({parsed.length})</Button>
      </DialogActions>
    </Stack>
  </Dialog>)
}
