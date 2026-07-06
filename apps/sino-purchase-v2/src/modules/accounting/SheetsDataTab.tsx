import { useState, useEffect, useMemo, useCallback } from "react"
import { Select, Spinner, Button, MenuItem, MultiSelect, Icon, IconNames } from "../../components/ui"
import { useAuth, listSheets, loadTable } from "@sino-purchase/sheets-react"
import { SPREADSHEET_ID } from "../../config/sheets"
import { useAccountingStore } from "../../app/stores/accountingStore"
import { DEMO_RECORDS } from "../../config/demo-data"
import type { CashRecord } from "./types"
import EmptyPlaceholder from "../../shared/components/EmptyPlaceholder"

const BATCH_KEYS = new Set(["批次", "batch", "Batch"])
const HIDDEN_COLS = new Set(["id", "ID", "编号"])

const FIELD_MAP: Record<string, keyof CashRecord> = {
  id: "id", 编号: "id", ID: "id",
  日期: "date",
  税务处理: "tax", 税务: "tax",
  描述: "description", 说明: "description",
  金额: "amount", 数额: "amount",
  类型: "type",
  批次: "batch",
  备注: "note",
}

function parseDate(dateStr: string): string {
  const d = dateStr?.trim() || ""
  if (/^\d+-\d+$/.test(d)) {
    const [m, day] = d.split("-")
    return `${new Date().getFullYear()}-${m.padStart(2, "0")}-${day.padStart(2, "0")}`
  }
  if (/^\d+\/\d+\/\d+$/.test(d)) {
    const [m, day, y] = d.split("/")
    return `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  return d
}

interface SheetsDataTabProps {
  batch: string[]
  onBatchChange: (v: string[]) => void
}

export default function SheetsDataTab({ batch, onBatchChange }: SheetsDataTabProps) {
  const { ready, loggedIn } = useAuth()
  const { showImportDialog } = useAccountingStore()
  const [sheets, setSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState("")
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const batchKey = useMemo(() => {
    if (data.length === 0) return null
    return Object.keys(data[0]).find(k => BATCH_KEYS.has(k)) ?? null
  }, [data])

  const displayHeaders = useMemo(() => headers.filter(h => !HIDDEN_COLS.has(h)), [headers])

  const batchOptions = useMemo(() => {
    if (!batchKey) return []
    const values = new Set(data.map(r => String(r[batchKey] ?? "")).filter(Boolean))
    return Array.from(values).sort()
  }, [data, batchKey])

  const filteredData = useMemo(() => {
    if (batch.length === 0 || !batchKey) return data
    return data.filter(r => batch.includes(String(r[batchKey] ?? "")))
  }, [data, batch, batchKey])

  useEffect(() => {
    if (!loggedIn) return
    const defaultName = `${new Date().getMonth() + 1}月`
    listSheets().then(names => {
      setSheets(names)
      setSelectedSheet(names.includes(defaultName) ? defaultName : (names[0] || ""))
    }).catch(() => setSheets([]))
  }, [loggedIn])

  useEffect(() => {
    if (!selectedSheet || !loggedIn) return
    setLoading(true)
    loadTable<Record<string, unknown>>(selectedSheet, [])
      .then(result => {
        setData(result.data)
        if (result.data.length > 0) setHeaders(Object.keys(result.data[0]))
        else setHeaders([])
      })
      .catch(() => { setData([]); setHeaders([]) })
      .finally(() => setLoading(false))
  }, [selectedSheet, loggedIn])

  const handleImport = useCallback(() => {
    const rows = filteredData
    if (rows.length === 0) return
    const records: CashRecord[] = []
    for (const row of rows) {
      const mapped: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(row)) {
        const field = FIELD_MAP[k]
        if (field && field !== "id") mapped[field] = v
      }
      records.push({
        id: crypto.randomUUID(),
        date: parseDate(String(mapped.date ?? "")),
        description: String(mapped.description ?? ""),
        amount: Math.abs(parseFloat(String(mapped.amount ?? "0").replace(/[^\d.-]/g, "")) || 0),
        tax: mapped.tax ? String(mapped.tax) : "无税",
        type: mapped.type ? String(mapped.type) : "其他",
        batch: String(mapped.batch ?? ""),
        note: String(mapped.note ?? ""),
      })
    }
    showImportDialog({ records, source: "excel" })
  }, [filteredData, showImportDialog])

  if (!ready) { return <EmptyPlaceholder description="加载 Google 认证..." /> }

  if (!loggedIn) {
    // Demo mode: show demo data as a read-only preview
    const demoHeaders = ["日期", "描述", "金额", "税务处理", "类型", "批次", "备注"]
    const demoDisplay = ["date", "description", "amount", "tax", "type", "batch", "note"]
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Demo 数据（登录后可编辑 Google Sheets）</span>
          <Button icon="database" text="导入数据源" intent="primary" onClick={handleImport} disabled small />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{DEMO_RECORDS.length} 条 [Demo]</span>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0, width: "100%" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-hover)", position: "sticky", top: 0, zIndex: 1 }}>
                <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>#</th>
                {demoHeaders.map(h => (<th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {DEMO_RECORDS.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "2px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>{i + 1}</td>
                  {demoDisplay.map(h => (<td key={h} style={{ padding: "2px 8px", whiteSpace: "nowrap" }}>{String(row[h as keyof CashRecord] ?? "")}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Select value={selectedSheet} options={sheets.map(s => ({ value: s, label: s }))} onChange={setSelectedSheet} />
        <div style={{ maxWidth: 200 }}>
          <MultiSelect
            items={batchOptions}
            selectedItems={batch}
            onItemSelect={v => { onBatchChange(batch.includes(v) ? batch.filter(x => x !== v) : [...batch, v]) }}
            tagRenderer={v => v}
            tagInputProps={{ onRemove: (v) => onBatchChange(batch.filter(x => x !== v)), placeholder: "批次" }}
            itemRenderer={(v, { handleClick }) => (<MenuItem key={v} text={v} selected={batch.includes(v)} shouldDismissPopover={false} onClick={(e: any) => { e.stopPropagation(); handleClick() }} icon={batch.includes(v) ? IconNames.TICK : IconNames.BLANK} />)}
            popoverProps={{ matchTargetWidth: true }}
            noResults={<span style={{ fontSize: 12, color: "var(--text-dim)", padding: "6px 8px", display: "block" }}>无匹配</span>}
          />
        </div>
        <Button icon="database" text="导入数据源" intent="primary" onClick={handleImport} disabled={filteredData.length === 0} small />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{filteredData.length}/{data.length}</span>
        <a href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--text-link)", textDecoration: "none" }}><Icon icon={IconNames.SHARE} /> 在 Google Sheets 中打开</a>
      </div>
      <div style={{ flex: 1, overflow: "auto", minHeight: 0, width: "100%" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><Spinner size={20} /></div>
        ) : filteredData.length === 0 ? (
          <EmptyPlaceholder icon={IconNames.SEARCH} title={data.length > 0 ? "无匹配数据" : "无数据"} />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-hover)", position: "sticky", top: 0, zIndex: 1 }}>
                <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>#</th>
                {displayHeaders.map(h => (<th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={String(row.id ?? i)} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "2px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>{i + 1}</td>
                  {displayHeaders.map(h => (<td key={h} style={{ padding: "2px 8px", whiteSpace: "nowrap" }}>{String(row[h] ?? "")}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
