import { useCallback, useState } from "react"
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
  const { updateRecord, deleteRecords } = useAccountingStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectAll(prev => {
      if (!prev) setSelectedIds(new Set(records.map(r => r.id)))
      else setSelectedIds(new Set())
      return !prev
    })
  }, [records])

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (confirm(`确定删除选中的 ${ids.length} 条记录？`)) {
      deleteRecords(ids)
      setSelectedIds(new Set())
    }
  }, [selectedIds, deleteRecords])

  const handleCellChange = useCallback((id: string, field: keyof CashRecord, value: string) => {
    updateRecord(id, field, field === "amount" ? Math.abs(parseFloat(value) || 0) : value)
  }, [updateRecord])

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{records.length} 条</span>
        {selectedIds.size > 0 && (
          <>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>已选 {selectedIds.size} 条</span>
            <button onClick={handleDelete} style={{ fontSize: 12, color: "var(--intent-danger)", background: "none", border: "none", cursor: "pointer" }}>
              删除选中
            </button>
          </>
        )}
      </div>
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {records.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>无数据，请导入</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-hover)", position: "sticky", top: 0, zIndex: 1 }}>
                <th style={{ padding: "6px 4px", width: 30 }}>
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} style={{ cursor: "pointer" }} />
                </th>
                {COLUMNS.map(c => <th key={c.key} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "2px 4px", textAlign: "center" }}>
                    <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} style={{ cursor: "pointer" }} />
                  </td>
                  {COLUMNS.map(c => (
                    <td key={c.key} style={{ padding: "2px 8px" }}>
                      <input
                        value={String(r[c.key] ?? "")}
                        onChange={e => handleCellChange(r.id, c.key, e.target.value)}
                        style={{ width: "100%", border: "none", background: "transparent", color: "inherit", fontSize: 12, fontFamily: "inherit", textAlign: c.key === "amount" ? "right" : "left", outline: "none", padding: 0 }}
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
