import { useCallback, useMemo, useState, useRef } from "react"
import { Table2, Column, Cell, EditableCell } from "@blueprintjs/table"
import { useAccountingStore } from "../../app/stores/accountingStore"
import type { CashRecord } from "./types"

const COLUMNS: { key: keyof CashRecord; label: string; width?: number }[] = [
  { key: "date", label: "日期", width: 110 },
  { key: "description", label: "描述", width: 200 },
  { key: "amount", label: "金额", width: 100 },
  { key: "tax", label: "税务", width: 90 },
  { key: "type", label: "类型", width: 100 },
  { key: "batch", label: "批次", width: 100 },
  { key: "note", label: "备注", width: 200 },
]

const taxColor = (tax: string) => {
  const s = tax.trim()
  if (!s) return undefined
  const h = (s.charCodeAt(0) * 7) % 360
  return `hsl(${h}, 50%, 75%)`
}

export default function CashGrid({ records }: { records: CashRecord[] }) {
  const { updateRecord } = useAccountingStore()
  const [sortBy, setSortBy] = useState<{ key: keyof CashRecord; desc: boolean } | null>(null)
  const cellRendererDependencies = useMemo(() => [records, sortBy], [records, sortBy])

  const sortedRecords = useMemo(() => {
    if (!sortBy) return records
    return [...records].sort((a, b) => {
      const av = String(a[sortBy.key] ?? "")
      const bv = String(b[sortBy.key] ?? "")
      const cmp = av.localeCompare(bv)
      return sortBy.desc ? -cmp : cmp
    })
  }, [records, sortBy])

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const record = sortedRecords[rowIndex]
    const col = COLUMNS[colIndex]
    if (!record || !col) return
    updateRecord(record.id, col.key, col.key === "amount" ? Math.abs(parseFloat(value) || 0) : value)
  }, [sortedRecords, updateRecord])

  const cellRenderer = useCallback((rowIndex: number, colIndex: number) => {
    const record = sortedRecords[rowIndex]
    const col = COLUMNS[colIndex]
    if (!record || !col) return <Cell />;
    const bgColor = col.key === "tax" ? taxColor(String(record[col.key] ?? "")) : undefined
    return (
      <EditableCell
        value={String(record[col.key] ?? "")}
        onChange={val => handleCellChange(rowIndex, colIndex, val)}
        style={{
          textAlign: col.key === "amount" ? "right" : "left",
          backgroundColor: bgColor,
        }}
      />
    )
  }, [sortedRecords, handleCellChange])

  const columnHeaderRenderer = useCallback((colIndex: number) => {
    const col = COLUMNS[colIndex]
    if (!col) return <Cell />;
    const isSorted = sortBy?.key === col.key
    const indicator = isSorted ? (sortBy.desc ? " ↓" : " ↑") : ""
    return (
      <Cell
        style={{ cursor: "pointer", fontWeight: 600, backgroundColor: "var(--bg-hover)" }}
        onClick={() => {
          setSortBy(prev =>
            prev?.key === col.key ? { key: col.key, desc: !prev.desc } : { key: col.key, desc: false }
          )
        }}
      >
        {col.label}{indicator}
      </Cell>
    )
  }, [sortBy])

  const numFrozenColumns = 0
  const numFrozenRows = 0
  const enableRowResizing = true
  const enableMultipleSelection = true
  const enableColumnReordering = true

  const rightTopMenu = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{records.length} 条</span>
      <div style={{ flex: 1 }} />
    </div>
  )

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {rightTopMenu}
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        {sortedRecords.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>无数据，请导入</div>
        ) : (
          <Table2
            numRows={sortedRecords.length}
            numFrozenColumns={numFrozenColumns}
            numFrozenRows={numFrozenRows}
            enableRowResizing={enableRowResizing}
            enableMultipleSelection={enableMultipleSelection}
            enableColumnReordering={enableColumnReordering}
            cellRendererDependencies={cellRendererDependencies}
            style={{ height: "100%", width: "100%" }}
          >
            {COLUMNS.map((col, colIndex) => (
              <Column
                key={col.key}
                name={col.label}
                width={col.width}
                cellRenderer={cellRenderer}
                columnHeaderCellRenderer={columnHeaderRenderer}
              />
            ))}
          </Table2>
        )}
      </div>
    </div>
  )
}
