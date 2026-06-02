import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, ButtonGroup, Switch } from "@blueprintjs/core"
import { Table2, Column, ColumnHeaderCell, EditableCell2 } from "@blueprintjs/table"
import MonacoEditor from "@monaco-editor/react"
import Papa from "papaparse"
import { useTheme } from "../theme/ThemeContext"
import { useCsv } from "../context/CsvContext"

interface CsvData {
  headers: string[]
  rows: string[][]
}

function parseCsv(text: string): CsvData {
  const result = Papa.parse(text, { skipEmptyLines: false })
  const data = result.data as string[][]
  if (data.length === 0) return { headers: [], rows: [] }
  const headers = data[0] ?? []
  const rows = data.slice(1).filter((row) => row.length > 0 || row.some((c) => c !== ""))
  return { headers, rows }
}

function serializeCsv(data: CsvData): string {
  return Papa.unparse([data.headers, ...data.rows])
}

const sampleCsv = `name,age,email
Alice,30,alice@example.com
Bob,25,bob@example.com
Charlie,35,charlie@example.com`

export default function CsvEditor() {
  const { theme } = useTheme()
  const [csvText, setCsvText] = useState(sampleCsv)
  const [showEditor, setShowEditor] = useState(true)

  const csvData = useMemo(() => parseCsv(csvText), [csvText])
  const csvDataRef = useRef(csvData)

  useEffect(() => {
    csvDataRef.current = csvData
  }, [csvData])

  const { selectedColumn, selectColumn, setColumns, setRows } = useCsv()

  useEffect(() => {
    setColumns(csvData.headers)
    setRows(csvData.rows.length)
  }, [csvData, setColumns, setRows])

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) setCsvText(value)
  }, [])

  const handleCellChange = useCallback(
    (value: string, rowIndex?: number, columnIndex?: number) => {
      if (rowIndex === undefined || columnIndex === undefined) return
      const data = csvDataRef.current
      const newRows = data.rows.map((row, ri) =>
        ri === rowIndex ? row.map((cell, ci) => (ci === columnIndex ? value : cell)) : row,
      )
      setCsvText(serializeCsv({ headers: data.headers, rows: newRows }))
    },
    [],
  )

  const handleAddRow = useCallback(() => {
    const data = csvDataRef.current
    const newRow = data.headers.map(() => "")
    setCsvText(serializeCsv({ headers: data.headers, rows: [...data.rows, newRow] }))
  }, [])

  const handleAddColumn = useCallback(() => {
    const data = csvDataRef.current
    const newHeaders = [...data.headers, `column_${data.headers.length}`]
    const newRows = data.rows.map((row) => [...row, ""])
    setCsvText(serializeCsv({ headers: newHeaders, rows: newRows }))
  }, [])

  const handleShowEditorChange = useCallback(() => {
    setShowEditor((prev) => !prev)
  }, [])

  const cellRenderer = useCallback(
    (rowIndex: number, colIndex: number) => {
      const value = csvDataRef.current.rows[rowIndex]?.[colIndex] ?? ""
      return <EditableCell2 value={value} onConfirm={handleCellChange} />
    },
    [handleCellChange],
  )

  const headerRenderer = useCallback(
    (colIndex: number) => (
      <ColumnHeaderCell
        name={csvData.headers[colIndex]}
        isColumnSelected={selectedColumn === colIndex}
        nameRenderer={(name) => (
          <div
            onClick={() => selectColumn(selectedColumn === colIndex ? null : colIndex)}
            style={{ cursor: "pointer", width: "100%", padding: "0 4px" }}
          >
            {name}
          </div>
        )}
      />
    ),
    [csvData.headers, selectedColumn, selectColumn],
  )

  return (
    <div className="csv-editor">
      <div className="csv-editor-toolbar">
        <ButtonGroup minimal>
          <Button icon="plus" text="Add Row" onClick={handleAddRow} />
          <Button icon="add-column-right" text="Add Column" onClick={handleAddColumn} />
        </ButtonGroup>
        <Switch
          checked={showEditor}
          onChange={handleShowEditorChange}
          label="Show Editor"
          style={{ margin: 0 }}
        />
      </div>
      <div className="csv-editor-body">
        {showEditor && (
          <div className="csv-editor-panel csv-editor-panel-editor">
            <MonacoEditor
              height="100%"
              defaultLanguage="csv"
              theme={theme === "dark" ? "vs-dark" : "light"}
              value={csvText}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>
        )}
        <div className="csv-editor-panel csv-editor-panel-table">
          <Table2 numRows={csvData.rows.length} enableGhostCells cellRendererDependencies={[csvText]}>
            {csvData.headers.map((header, colIndex) => (
              <Column
                key={colIndex}
                name={header}
                cellRenderer={cellRenderer}
                columnHeaderCellRenderer={headerRenderer}
              />
            ))}
          </Table2>
        </div>
      </div>
    </div>
  )
}
