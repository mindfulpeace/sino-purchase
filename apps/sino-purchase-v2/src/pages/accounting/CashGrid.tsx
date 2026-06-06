import { useMemo, useState, useCallback } from "react"
import { Table2, Column } from "@blueprintjs/table"
import type { CashRecord } from "./types"
import { formatAmount } from "./helpers"

type SortKey = keyof CashRecord

const COLUMNS = [
  { label: "ID", key: "id" as SortKey },
  { label: "日期", key: "date" as SortKey },
  { label: "税务", key: "tax" as SortKey },
  { label: "描述", key: "description" as SortKey },
  { label: "金额", key: "amount" as SortKey },
  { label: "类型", key: "type" as SortKey },
  { label: "批次", key: "batch" as SortKey },
]

interface CashGridProps {
  records: CashRecord[]
}

export default function CashGrid({ records }: CashGridProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDesc, setSortDesc] = useState(false)

  const taxColors = useMemo(() => {
    const uniqueTaxes = [...new Set(records.map((d) => d.tax).filter(Boolean))]
    if (uniqueTaxes.length === 0) return new Map<string, string>()
    const step = Math.floor(360 / uniqueTaxes.length)
    return new Map(uniqueTaxes.map((tax, i) => [tax, `hsl(${i * step}, 5%, 18%)`]))
  }, [records])

  const sortedData = useMemo(() => {
    if (!sortKey) return records
    return [...records].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      let cmp: number
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }
      return sortDesc ? -cmp : cmp
    })
  }, [records, sortKey, sortDesc])

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDesc((d) => !d)
        return prev
      }
      setSortDesc(false)
      return key
    })
  }, [])

  const cellRenderer = useCallback(
    (rowIndex: number, colIndex: number) => {
      const row = sortedData[rowIndex]
      if (!row) return null

      const isEmptyBatch = !row.batch
      const bgColor = taxColors.get(row.tax)
      const style: React.CSSProperties = {
        background: bgColor,
        color: isEmptyBatch ? "#999" : undefined,
        textAlign: colIndex === 4 ? "right" : undefined,
        padding: "0 8px",
      }

      const values = [
        row.id.slice(0, 8),
        row.date,
        row.tax,
        row.description,
        formatAmount(row.amount),
        row.type,
        row.batch,
      ]

      return <div style={style}>{values[colIndex]}</div>
    },
    [sortedData, taxColors],
  )

  const columnHeaderRenderer = useCallback(
    (colIndex: number) => {
      const col = COLUMNS[colIndex]
      const isActive = sortKey === col.key
      return (
        <div
          onClick={() => handleSort(col.key)}
          style={{ cursor: "pointer", fontWeight: "bold", userSelect: "none", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" }}
        >
          {col.label}
          {isActive ? (sortDesc ? " ▼" : " ▲") : ""}
        </div>
      )
    },
    [sortKey, sortDesc, handleSort],
  )

  if (records.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)" }}>
        请从剪贴板或 Excel 导入数据
      </div>
    )
  }

  return (
    <Table2 numRows={sortedData.length} enableGhostCells cellRendererDependencies={[sortedData]}>
      {COLUMNS.map((col) => (
        <Column key={col.key} cellRenderer={cellRenderer} columnHeaderCellRenderer={columnHeaderRenderer} />
      ))}
    </Table2>
  )
}
