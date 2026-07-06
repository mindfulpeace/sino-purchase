import { useCallback } from "react"
import { Button, ButtonGroup, Tooltip, Box } from "../../components/ui"
import { useImportClipboard } from "./useImportClipboard"
import { useImportExcel } from "./useImportExcel"
import { exportExcel } from "./sheetjs"
import { formatDataSummary } from "./helpers"
import { useDocSettingsStore } from "../../app/stores/docSettingsStore"
import type { CashRecord } from "./types"

interface ToolbarProps {
  records: CashRecord[]
  showSheets: boolean
  onSheetsToggle: () => void
}

export default function Toolbar({ records, showSheets, onSheetsToggle }: ToolbarProps) {
  const { propertiesVisible, setPropertiesVisible } = useDocSettingsStore()
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

  const handlePrintSettings = useCallback(() => {
    setPropertiesVisible((v) => !v)
  }, [setPropertiesVisible])

  return (
    <Box className="no-print" sx={{ display: "flex", alignItems: "center", gap: 0.5, p: "4px 8px", borderBottom: "1px solid var(--border)" }}>
      <ButtonGroup minimal>
        <Tooltip content={showSheets ? "关闭数据源" : "打开 Google Sheets 数据源"}>
          <Button icon="database" text="数据源" intent={showSheets ? "primary" : "none"} onClick={onSheetsToggle} />
        </Tooltip>
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

      <Box sx={{ flex: 1 }} />

      <span style={{ fontSize: 12, color: "var(--text-dim)", marginRight: 8 }}>{summary}</span>

      <Tooltip content={propertiesVisible ? "关闭打印设置" : "打开打印设置"}>
        <Button icon="print" intent={propertiesVisible ? "primary" : "none"} onClick={handlePrintSettings} />
      </Tooltip>

      <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleExcel} style={{ display: "none" }} title="导入Excel文件" aria-label="选择Excel文件进行导入" />
    </Box>
  )
}
