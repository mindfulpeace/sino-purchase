// @ts-nocheck
import { useCallback, useMemo } from "react"
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

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const record = records[rowIndex]
    const col = COLUMNS[colIndex]
    if (!record || !col) return
    updateRecord(record.id, col.key, col.key === "amount" ? Math.abs(parseFloat(value) || 0) : value)
  }, [records, updateRecord])

  const rightTopMenu = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{records.length} 条</span>
      <div style={{ flex: 1 }} />
    </div>
  )

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {rightTopMenu}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {records.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>无数据，请导入</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-hover)", position: "sticky", top: 0, zIndex: 1 }}>
                {COLUMNS.map(col => (
                  <th key={col.key} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((row, rowIdx) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  {COLUMNS.map((col, colIdx) => (
                    <td key={col.key} style={{ padding: 0 }}>
                      <input
                        value={String(row[col.key] ?? "")}
                        onChange={e => handleCellChange(rowIdx, colIdx, e.target.value)}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          color: "inherit",
                          fontSize: 12,
                          fontFamily: "inherit",
                          textAlign: col.key === "amount" ? "right" : "left",
                          outline: "none",
                          padding: "4px 8px",
                        }}
                        onFocus={e => { e.currentTarget.style.background = "var(--bg-hover)" }}
                        onBlur={e => { e.currentTarget.style.background = "transparent" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
