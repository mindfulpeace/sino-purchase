import { useState, useEffect, useCallback, useMemo } from "react"
import { Button, Dialog, RadioGroup, Radio, Classes, DialogActions, Box, Stack } from "../../components/ui"
import type { CashRecord } from "./types"
import { formatAmount } from "./helpers"

type ImportMode = "append" | "replace"

interface ImportDialogProps {
  open: boolean
  records: CashRecord[]
  onConfirm: (records: CashRecord[], mode: ImportMode) => void
  onCancel: () => void
}

const FIELDS: { key: keyof CashRecord; label: string; width?: number }[] = [
  { key: "date", label: "日期", width: 100 },
  { key: "tax", label: "税务", width: 80 },
  { key: "description", label: "描述" },
  { key: "amount", label: "金额", width: 80 },
  { key: "type", label: "类型", width: 120 },
  { key: "batch", label: "批次", width: 80 },
]

export default function ImportDialog({ open, records, onConfirm, onCancel }: ImportDialogProps) {
  const [edited, setEdited] = useState<CashRecord[]>([])
  const [mode, setMode] = useState<ImportMode>("replace")

  useEffect(() => {
    if (open) { setEdited(records.map(r => ({ ...r }))); setMode("replace") }
  }, [open, records])

  const updateField = useCallback((idx: number, key: keyof CashRecord, value: string) => {
    setEdited(prev => prev.map((r, i) => i !== idx ? r : { ...r, [key]: key === "amount" ? Math.abs(parseFloat(value) || 0) : value }))
  }, [])

  const total = useMemo(() => edited.reduce((sum, r) => sum + (r.amount || 0), 0), [edited])

  return (
    <Dialog isOpen={open} onClose={onCancel} title={`导入确认 — ${edited.length} 条记录，合计 ${formatAmount(total)}`} style={{ width: 750 }}>
      <Box className={Classes.DIALOG_BODY} sx={{ maxHeight: 420, overflow: "auto", p: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-hover)", position: "sticky", top: 0, zIndex: 1 }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>#</th>
              {FIELDS.map(f => <th key={f.key} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", width: f.width }}>{f.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {edited.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "2px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>{idx + 1}</td>
                {FIELDS.map(f => (
                  <td key={f.key} style={{ padding: "2px 8px" }}>
                    <input value={String(row[f.key] ?? "")} onChange={e => updateField(idx, f.key, e.target.value)}
                      style={{ width: "100%", border: "none", background: "transparent", color: "inherit", fontSize: 12, fontFamily: "inherit", textAlign: f.key === "amount" ? "right" : "left", outline: "none", padding: 0 }}
                      onFocus={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onBlur={e => (e.currentTarget.style.background = "transparent")}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <DialogActions style={{ display: "flex", justifyContent: "space-between" }}>
        <RadioGroup inline selectedValue={mode} onChange={e => setMode(e.currentTarget.value as ImportMode)} style={{ margin: 0 }}>
          <Radio label="替换" value="replace" />
          <Radio label="追加" value="append" />
        </RadioGroup>
        <Stack direction="row" spacing={1}>
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={() => onConfirm(edited, mode)} intent="primary">确认导入</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
