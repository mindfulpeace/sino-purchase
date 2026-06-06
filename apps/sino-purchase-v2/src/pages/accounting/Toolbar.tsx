import { useRef, useCallback } from "react"
import { Button, ButtonGroup, Tooltip } from "@blueprintjs/core"
import { useImportClipboard } from "./useImportClipboard"
import { useImportExcel } from "./useImportExcel"
import { exportExcel } from "./sheetjs"
import { formatDataSummary } from "./helpers"
import type { CashRecord } from "./types"

interface ToolbarProps {
  records: CashRecord[]
  onPrintToggle: () => void
  showPrint: boolean
}

export default function Toolbar({ records, onPrintToggle, showPrint }: ToolbarProps) {
  const { importFromClipboard } = useImportClipboard()
  const { triggerImport, inputRef, handleFileChange } = useImportExcel()
  const handleClipboard = useCallback(async () => {
    try {
      await importFromClipboard()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "导入失败"
      alert(msg)
    }
  }, [importFromClipboard])

  const handleExcel = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        await handleFileChange(e)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "导入失败"
        alert(msg)
      }
    },
    [handleFileChange],
  )

  const handleExport = useCallback(async () => {
    try {
      await exportExcel(records)
    } catch (err) {
      alert("导出失败")
    }
  }, [records])

  const summary = formatDataSummary(records)

  return (
    <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>
      <ButtonGroup minimal>
        <Tooltip content="从 Excel 导入">
          <Button icon="import" text="Excel" onClick={triggerImport} />
        </Tooltip>
        <Tooltip content="从剪贴板粘贴">
          <Button icon="clipboard" text="粘贴" onClick={handleClipboard} />
        </Tooltip>
        <Tooltip content="导出为 Excel">
          <Button icon="export" text="导出" onClick={handleExport} />
        </Tooltip>
      </ButtonGroup>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 12, color: "var(--text-dim)", marginRight: 8 }}>{summary}</span>

      <Tooltip content={showPrint ? "隐藏打印预览" : "显示打印预览"}>
        <Button
          icon="print"
          text="报销单"
          intent={showPrint ? "primary" : "none"}
          onClick={onPrintToggle}
        />
      </Tooltip>

      <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleExcel} style={{ display: "none" }} />
    </div>
  )
}
