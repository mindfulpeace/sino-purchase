import { useEffect, useCallback, useState } from "react"
import { Button, Tooltip, Tabs, Tab, Box, Stack } from "../components/ui"
import { useAccountingStore } from "../app/stores/accountingStore"
import { useDocSettingsStore } from "../app/stores/docSettingsStore"
import { useAuth } from "@sino-purchase/sheets-react"
import CashGrid from "../modules/accounting/CashGrid"
import ImportDialog from "../modules/accounting/ImportDialog"
import SheetsDataTab from "../modules/accounting/SheetsDataTab"
import { useImportClipboard } from "../modules/accounting/useImportClipboard"
import { useImportExcel } from "../modules/accounting/useImportExcel"
import { exportExcel } from "../modules/accounting/sheetjs"
import { formatDataSummary } from "../modules/accounting/helpers"
import type { CashRecord } from "../modules/accounting/types"
import { DEMO_RECORDS } from "../config/demo-data"

export default function Accounting() {
  const { records, activeTab, importDialog, setRecords, addRecords, hideImportDialog, switchTab } = useAccountingStore()
  const { setReimburseRecords } = useDocSettingsStore()
  const { loggedIn } = useAuth()
  const { importFromClipboard } = useImportClipboard()
  const { triggerImport, inputRef, handleFileChange } = useImportExcel()
  const [sheetsBatch, setSheetsBatch] = useState<string[]>([])

  // Demo mode: seed records when not logged in
  useEffect(() => {
    if (!loggedIn && records.length === 0) {
      setRecords(DEMO_RECORDS)
    }
  }, [loggedIn, records.length, setRecords])

  // Sync records to doc settings for printing
  const summary = formatDataSummary(records)
  useEffect(() => {
    setReimburseRecords(records)
  }, [records])

  const handleClipboard = useCallback(async () => {
    try {
      await importFromClipboard()
    } catch (err) {
      alert(err instanceof Error ? err.message : "导入失败")
    }
  }, [importFromClipboard])

  const handleExcel = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        await handleFileChange(e)
      } catch (err) {
        alert(err instanceof Error ? err.message : "导入失败")
      }
    },
    [handleFileChange],
  )

  const handleExport = useCallback(async () => {
    try {
      await exportExcel(records)
    } catch {
      alert("导出失败")
    }
  }, [records])

  const handleConfirmImport = useCallback((records: CashRecord[], mode: "append" | "replace") => {
    if (records.length > 0) {
      if (mode === "replace") setRecords(records)
      else addRecords(records)
    }
    hideImportDialog()
    switchTab("preview")
  }, [setRecords, addRecords, hideImportDialog, switchTab])

  return (
    <Stack sx={{ height: "100%", overflow: "hidden" }}>
      <Box className="no-print" sx={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Box sx={{ display: "flex" }}>
          <Tabs value={activeTab} onChange={(v: any) => switchTab(v)}>
            <Tab value="sheets" label="数据源" />
            <Tab value="preview" label="数据预览" />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ p: "2px 8px" }}>
          <Tooltip content="从 Excel 导入">
            <Button icon="import" text="Excel" onClick={triggerImport} small />
          </Tooltip>
          <Tooltip content="从剪贴板粘贴">
            <Button icon="clipboard" text="粘贴" onClick={handleClipboard} small />
          </Tooltip>
          <Tooltip content="导出为 Excel">
            <Button icon="export" text="导出" onClick={handleExport} small />
          </Tooltip>
          <Box sx={{ width: 1, height: 16, background: "var(--border)", mx: "4px" }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>{summary}</span>
        </Stack>

        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleExcel} style={{ display: "none" }} title="导入Excel文件" aria-label="导入Excel文件" />
      </Box>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ display: activeTab === "sheets" ? "flex" : "none", height: "100%" }}>
          <SheetsDataTab batch={sheetsBatch} onBatchChange={setSheetsBatch} />
        </Box>
        <Box sx={{ display: activeTab === "preview" ? "flex" : "none", height: "100%" }}>
          <CashGrid records={records} />
        </Box>
      </Box>

      <ImportDialog
        open={importDialog.open}
        records={importDialog.importRecord?.records || []}
        onConfirm={handleConfirmImport}
        onCancel={hideImportDialog}
      />
    </Stack>
  )
}
