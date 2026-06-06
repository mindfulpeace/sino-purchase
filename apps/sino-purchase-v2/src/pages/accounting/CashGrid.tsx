import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { Table2, Column, EditableCell } from "@blueprintjs/table"
import type { FocusedCellCoordinates, Region } from "@blueprintjs/table"
import { IconNames } from "@blueprintjs/icons"
import type { CashRecord } from "./types"
import { formatAmount } from "./helpers"
import { useAccounting } from "./AccountingContext"
import EmptyPlaceholder from "../../components/EmptyPlaceholder"

type SortKey = keyof CashRecord

const ALL_COLUMNS = [
  { label: "日期", key: "date" as SortKey, editable: true, width: 95, align: "center" as const },
  { label: "税务", key: "tax" as SortKey, editable: true, width: 80, align: "center" as const },
  { label: "描述", key: "description" as SortKey, editable: true, width: 200 },
  { label: "金额", key: "amount" as SortKey, editable: true, width: 100, align: "right" as const },
  { label: "类型", key: "type" as SortKey, editable: true, width: 150, align: "left" as const },
  { label: "批次", key: "batch" as SortKey, editable: true, width: 70, align: "center" as const },
]

const COLUMNS = ALL_COLUMNS

interface CashGridProps {
  records: CashRecord[]
}

export default function CashGrid({ records }: CashGridProps) {
  const { updateRecord, deleteRecords } = useAccounting()
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDesc, setSortDesc] = useState(false)
  const [focusedCell, setFocusedCell] = useState<FocusedCellCoordinates | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([])
  const tableRef = useRef<HTMLDivElement>(null)

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

  const selectedIds = useMemo(() => {
    const set = new Set<string>()
    for (const region of selectedRegions) {
      if (!region.rows) continue
      for (let i = region.rows[0]; i <= region.rows[1]; i++) {
        const row = sortedData[i]
        if (row) set.add(row.id)
      }
    }
    return [...set]
  }, [selectedRegions, sortedData])

  const pasteCell = useCallback((rowIdx: number, colIdx: number, val: string) => {
    const row = sortedData[rowIdx]
    if (!row) return
    const col = COLUMNS[colIdx]
    if (!col?.editable) return
    const parsedValue = col.key === "amount" ? (Number(val.replace(/[^\d.-]/g, "")) || 0) : val
    updateRecord(row.id, col.key, parsedValue)
  }, [sortedData, updateRecord])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!focusedCell) return
    const text = e.clipboardData?.getData("text/plain")
    if (!text) return
    e.preventDefault()
    text.split("\n").filter(r => r.trim()).forEach((rowStr, rOff) => {
      rowStr.split("\t").forEach((val, cOff) => {
        pasteCell(focusedCell.row + rOff, focusedCell.col + cOff, val)
      })
    })
  }, [focusedCell, pasteCell])

  useEffect(() => {
    const el = tableRef.current
    if (!el) return
    el.addEventListener("paste", handlePaste)
    return () => el.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  useEffect(() => {
    const el = tableRef.current
    if (!el) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        deleteRecords(selectedIds)
      }
    }
    el.addEventListener("keydown", onKeyDown)
    return () => el.removeEventListener("keydown", onKeyDown)
  }, [selectedIds, deleteRecords])

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
    (row: CashRecord, col: (typeof COLUMNS)[number]): React.CSSProperties => {
      const isEmptyBatch = !row.batch
      const bgColor = taxColors.get(row.tax)
      return {
        background: bgColor,
        color: isEmptyBatch ? "#999" : undefined,
        textAlign: col.align,
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
      if (!row) return <div />
      const col = COLUMNS[colIndex]
      const style = getCellStyle(row, col)

      let displayValue: string
      if (col.key === "amount") {
        displayValue = formatAmount(row.amount)
      } else {
        displayValue = String(row[col.key] ?? "")
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
          style={{ cursor: "pointer", fontWeight: "bold", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "4px 8px" }}
        >
          {col.label}
          {isActive ? (sortDesc ? " ▼" : " ▲") : ""}
        </div>
      )
    },
    [sortKey, sortDesc, handleSort],
  )

  if (records.length === 0) {
    return <EmptyPlaceholder icon={IconNames.IMPORT} title="请从剪贴板或 Excel 导入数据" />
  }

  return (
    <div ref={tableRef} style={{ width: "100%", height: "100%" }}>
      <Table2
        numRows={sortedData.length}
        enableColumnResizing
        enableFocusedCell
        onFocusedCell={setFocusedCell}
        onSelection={setSelectedRegions}
        onCopy={() => {}}
        cellRendererDependencies={[sortedData]}
        columnWidths={COLUMNS.map(c => c.width)}
      >
        {COLUMNS.map((col) => (
          <Column key={col.key} cellRenderer={cellRenderer} columnHeaderCellRenderer={columnHeaderRenderer} />
        ))}
      </Table2>
    </div>
  )
}
