// @ts-nocheck
import { useCallback, useMemo } from "react"
import { Table2, Column, Cell, EditableCell } from "@blueprintjs/table"
import { useAccountingStore } from "../../app/stores/accountingStore"
import type { CashRecord } from "./types"

const COLUMNS: { key: keyof CashRecord; label: string }[] = [
  { key: "date", label: "日期" },
  { key: "description", label: "描述" },
  { key: "amount", label: "金额" },
  { key: "tax", label: "税务" },
  { key: "type", label: "类型" },
  { key: "batch", label: "批次" },
  { key: "note", label: "备注" },
]

export default function CashGrid({ records }: { records: CashRecord[] }) {
  const { updateRecord } = useAccountingStore()
  const cellRendererDependencies = useMemo(() => [records], [records])

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const record = records[rowIndex]
    const col = COLUMNS[colIndex]
    if (!record || !col) return
    updateRecord(record.id, col.key, col.key === "amount" ? Math.abs(parseFloat(value) || 0) : value)
  }, [records, updateRecord])

  const cellRenderer = useCallback((rowIndex: number, colIndex: number) => {
    const record = records[rowIndex]
    const col = COLUMNS[colIndex]
    if (!record || !col) return <Cell />;
    return (
      <EditableCell
        value={String(record[col.key] ?? "")}
        onChange={val => handleCellChange(rowIndex, colIndex, val)}
      />
    )
  }, [records, handleCellChange])

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
        {records.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>无数据，请导入</div>
        ) : (
          <Table2
            numRows={records.length}
            cellRendererDependencies={cellRendererDependencies}
          >
            {COLUMNS.map((col) => (
              <Column
                key={col.key}
                name={col.label}
                cellRenderer={cellRenderer}
              />
            ))}
          </Table2>
        )}
      </div>
    </div>
  )
}
