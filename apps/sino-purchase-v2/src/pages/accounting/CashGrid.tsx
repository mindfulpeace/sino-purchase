import { useMemo, useState, useCallback } from "react"
import { Table2, Column, EditableCell } from "@blueprintjs/table"
import type { CashRecord } from "./types"
import { formatAmount } from "./helpers"
import { useAccounting } from "./AccountingContext"

type SortKey = keyof CashRecord

const COLUMNS = [
  { label: "ID", key: "id" as SortKey, editable: false },
  { label: "日期", key: "date" as SortKey, editable: true },
  { label: "税务", key: "tax" as SortKey, editable: true },
  { label: "描述", key: "description" as SortKey, editable: true },
  { label: "金额", key: "amount" as SortKey, editable: true },
  { label: "类型", key: "type" as SortKey, editable: true },
  { label: "批次", key: "batch" as SortKey, editable: true },
]

interface CashGridProps {
  records: CashRecord[]
}

export default function CashGrid({ records }: CashGridProps) {
  const { updateRecord } = useAccounting()
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

  const getCellStyle = useCallback(
    (row: CashRecord, colIndex: number): React.CSSProperties => {
      const isEmptyBatch = !row.batch
      const bgColor = taxColors.get(row.tax)
      return {
        background: bgColor,
        color: isEmptyBatch ? "#999" : undefined,
        textAlign: colIndex === 4 ? "right" : undefined,
      }
    },
    [taxColors],
  )

  const handleCellConfirm = useCallback(
    (value: string, rowIndex: number | undefined, colIndex: number | undefined) => {
      if (rowIndex === undefined || colIndex === undefined) return
      const row = sortedData[rowIndex]
      if (!row) return
      const colKey = COLUMNS[colIndex]?.key
      if (!colKey || !COLUMNS[colIndex]?.editable) return
      const parsedValue = colKey === "amount" ? (Number(value) || 0) : value
      updateRecord(row.id, colKey, parsedValue)
    },
    [sortedData, updateRecord],
  )

  const cellRenderer = useCallback(
    (rowIndex: number, colIndex: number) => {
      const row = sortedData[rowIndex]
      if (!row) return null
      const col = COLUMNS[colIndex]
      const style = getCellStyle(row, colIndex)

      let displayValue: string
      if (col.key === "id") {
        displayValue = row.id.slice(0, 8)
      } else if (col.key === "amount") {
        displayValue = formatAmount(row.amount)
      } else {
        displayValue = String(row[col.key] ?? "")
      }

      if (!col.editable) {
        return <div style={{ ...style, padding: "0 8px", height: "100%", display: "flex", alignItems: "center" }}>{displayValue}</div>
      }

      return (
        <EditableCell
          value={displayValue}
          rowIndex={rowIndex}
          columnIndex={colIndex}
          onConfirm={handleCellConfirm}
          style={style}
        />
      )
    },
    [sortedData, getCellStyle, handleCellConfirm],
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
