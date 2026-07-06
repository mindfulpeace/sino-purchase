import { useCallback, useRef } from "react"
import { Box, Stack } from "../../components/ui"
import { useVirtualizer } from "@tanstack/react-virtual"
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

// 审计 P1-6：行虚拟化，避免记录累积后一次性渲染全部 DOM 导致卡顿。
const ROW_HEIGHT = 29

export default function CashGrid({ records }: { records: CashRecord[] }) {
  const { updateRecord } = useAccountingStore()
  const parentRef = useRef<HTMLDivElement>(null)

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const record = records[rowIndex]
    const col = COLUMNS[colIndex]
    if (!record || !col) return
    updateRecord(record.id, col.key, col.key === "amount" ? Math.abs(parseFloat(value) || 0) : value)
  }, [records, updateRecord])

  const virtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const items = virtualizer.getVirtualItems()
  const paddingTop = items.length > 0 ? items[0].start : 0
  const paddingBottom = items.length > 0 ? virtualizer.getTotalSize() - items[items.length - 1].end : 0

  const rightTopMenu = (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ p: "4px 8px", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{records.length} 条</span>
      <Box sx={{ flex: 1 }} />
    </Stack>
  )

  return (
    <Stack sx={{ height: "100%" }}>
      {rightTopMenu}
      <Box ref={parentRef} sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {records.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>无数据，请导入</Box>
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
              {paddingTop > 0 && (
                <tr aria-hidden style={{ height: paddingTop }}>
                  <td colSpan={COLUMNS.length} style={{ padding: 0, border: "none" }} />
                </tr>
              )}
              {items.map(vi => {
                const row = records[vi.index]
                if (!row) return null
                return (
                  <tr
                    key={row.id}
                    data-index={vi.index}
                    ref={virtualizer.measureElement}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {COLUMNS.map((col, colIdx) => (
                      <td key={col.key} style={{ padding: 0 }}>
                        <input
                          value={String(row[col.key] ?? "")}
                          onChange={e => handleCellChange(vi.index, colIdx, e.target.value)}
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
                )
              })}
              {paddingBottom > 0 && (
                <tr aria-hidden style={{ height: paddingBottom }}>
                  <td colSpan={COLUMNS.length} style={{ padding: 0, border: "none" }} />
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Box>
    </Stack>
  )
}
