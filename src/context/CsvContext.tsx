import { createContext, useContext, useState, type ReactNode } from "react"

type ColumnType = "string" | "number" | "date"

interface CsvContextValue {
  columns: string[]
  rows: number
  selectedColumn: number | null
  selectColumn: (col: number | null) => void
  columnTypes: Record<number, ColumnType>
  setColumnType: (col: number, type: ColumnType) => void
  columnAlignment: Record<number, "left" | "center" | "right">
  setColumnAlignment: (col: number, align: "left" | "center" | "right") => void
  rowSeparator: string
  setRowSeparator: (sep: string) => void
  headerRow: boolean
  setHeaderRow: (v: boolean) => void
  setColumns: (cols: string[]) => void
  setRows: (n: number) => void
}

const CsvContext = createContext<CsvContextValue | null>(null)

export function CsvProvider({ children }: { children: ReactNode }) {
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState(0)
  const [selectedColumn, selectColumn] = useState<number | null>(null)
  const [columnTypes, setColumnType] = useState<Record<number, ColumnType>>({})
  const [columnAlignment, setColumnAlignment] = useState<Record<number, "left" | "center" | "right">>({})
  const [rowSeparator, setRowSeparator] = useState(",")
  const [headerRow, setHeaderRow] = useState(true)

  const setColType = (col: number, type: ColumnType) =>
    setColumnType((prev) => ({ ...prev, [col]: type }))

  const setColAlign = (col: number, align: "left" | "center" | "right") =>
    setColumnAlignment((prev) => ({ ...prev, [col]: align }))

  return (
    <CsvContext.Provider
      value={{
        columns,
        rows,
        selectedColumn,
        selectColumn,
        columnTypes,
        setColumnType: setColType,
        columnAlignment,
        setColumnAlignment: setColAlign,
        rowSeparator,
        setRowSeparator,
        headerRow,
        setHeaderRow,
        setColumns,
        setRows,
      }}
    >
      {children}
    </CsvContext.Provider>
  )
}

export function useCsv() {
  const ctx = useContext(CsvContext)
  if (!ctx) throw new Error("useCsv must be used within CsvProvider")
  return ctx
}
