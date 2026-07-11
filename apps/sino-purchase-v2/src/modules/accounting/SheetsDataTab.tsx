import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Select, Spinner, Button, Icon, IconNames, Box, Stack } from "../../components/ui"
import MuiSelect from "@mui/material/Select"
import MuiMenuItem from "@mui/material/MenuItem"
import MuiCheckbox from "@mui/material/Checkbox"
import MuiListItemText from "@mui/material/ListItemText"
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

  // 审计 P1-6：行虚拟化，避免大表一次性渲染全部 DOM
  const tableParentRef = useRef<HTMLDivElement>(null)
  const tableVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 29,
    overscan: 10,
  })
  const tableItems = tableVirtualizer.getVirtualItems()
  const tablePaddingTop = tableItems.length > 0 ? tableItems[0].start : 0
  const tablePaddingBottom = tableItems.length > 0 ? tableVirtualizer.getTotalSize() - tableItems[tableItems.length - 1].end : 0

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
      <Stack sx={{ height: "100%", width: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: "4px 8px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Demo 数据（登录后可编辑 Google Sheets）</span>
          <Button icon="database" text="导入数据源" intent="primary" onClick={handleImport} disabled small />
          <Box sx={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{DEMO_RECORDS.length} 条 [Demo]</span>
        </Stack>
        <Box sx={{ flex: 1, overflow: "auto", minHeight: 0, width: "100%" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-surface)", position: "sticky", top: 0, zIndex: 2 }}>
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
        </Box>
      </Stack>
    )
  }

  return (
    <Stack sx={{ height: "100%", width: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: "4px 8px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Select value={selectedSheet} options={sheets.map(s => ({ value: s, label: s }))} onChange={setSelectedSheet} />
        <Box sx={{ maxWidth: 200 }}>
          <MuiSelect
            multiple
            value={batch}
            displayEmpty
            onChange={(e: any) => {
              const v = e.target.value
              onBatchChange(Array.isArray(v) ? v : v.split(","))
            }}
            renderValue={(selected: any) =>
              (selected as string[]).length === 0 ? "批次" : (selected as string[]).join(", ")
            }
            size="small"
            sx={{
              fontSize: 12,
              fontFamily: "inherit",
              height: 24,
              "& .MuiInputBase-root": { height: 24, padding: 0 },
              "& .MuiOutlinedInput-root": { padding: 0 },
              "& .MuiSelect-select": { padding: "2px 8px" },
              "& fieldset": { borderColor: "var(--border, #3a3a5a)" },
            }}
          >
            {batchOptions.length === 0 ? (
              <MuiMenuItem disabled sx={{ fontSize: 12 }}>无批次数据</MuiMenuItem>
            ) : (
              batchOptions.map((b) => (
                <MuiMenuItem key={b} value={b} sx={{ fontSize: 12 }}>
                  <MuiCheckbox
                    checked={batch.indexOf(b) > -1}
                    size="small"
                    sx={{ p: 0, mr: 0.5, "& .MuiSvgIcon-root": { fontSize: 16 } }}
                  />
                  <MuiListItemText primary={b} sx={{ my: 0, "& .MuiTypography-root": { fontSize: 12 } }} />
                </MuiMenuItem>
              ))
            )}
          </MuiSelect>
        </Box>
        <Button icon="database" text="导入数据源" intent="primary" onClick={handleImport} disabled={filteredData.length === 0} small />
        <Box sx={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{filteredData.length}/{data.length}</span>
        {SPREADSHEET_ID && (
          <a href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--text-link)", textDecoration: "none" }}><Icon icon={IconNames.SHARE} /> 在 Google Sheets 中打开</a>
        )}
      </Stack>
      <Box ref={tableParentRef} sx={{ flex: 1, overflow: "auto", minHeight: 0, width: "100%" }}>
        {loading ? (
          <Stack justifyContent="center" alignItems="center" sx={{ height: "100%" }}><Spinner size={20} /></Stack>
        ) : filteredData.length === 0 ? (
          <EmptyPlaceholder icon={IconNames.SEARCH} title={data.length > 0 ? "无匹配数据" : "无数据"} />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-surface)", position: "sticky", top: 0, zIndex: 2 }}>
                <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>#</th>
                {displayHeaders.map(h => (<th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {tablePaddingTop > 0 && (
                <tr aria-hidden style={{ height: tablePaddingTop }}>
                  <td colSpan={displayHeaders.length + 1} style={{ padding: 0, border: "none" }} />
                </tr>
              )}
              {tableItems.map(vi => {
                const row = filteredData[vi.index]
                if (!row) return null
                const i = vi.index
                return (
                  <tr
                    key={String(row.id ?? i)}
                    data-index={vi.index}
                    ref={tableVirtualizer.measureElement}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "2px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>{i + 1}</td>
                    {displayHeaders.map(h => (<td key={h} style={{ padding: "2px 8px", whiteSpace: "nowrap" }}>{String(row[h] ?? "")}</td>))}
                  </tr>
                )
              })}
              {tablePaddingBottom > 0 && (
                <tr aria-hidden style={{ height: tablePaddingBottom }}>
                  <td colSpan={displayHeaders.length + 1} style={{ padding: 0, border: "none" }} />
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Box>
    </Stack>
  )
}
