import { useEffect, useCallback, useState } from "react"
import { Button, Tooltip } from "@blueprintjs/core"
import { useAccountingStore } from "../app/stores/accountingStore"
import { useDocSettingsStore } from "../app/stores/docSettingsStore"
import CashGrid from "../modules/accounting/CashGrid"
import ImportDialog from "../modules/accounting/ImportDialog"
import SheetsDataTab from "../modules/accounting/SheetsDataTab"
import { useImportClipboard } from "../modules/accounting/useImportClipboard"
import { useImportExcel } from "../modules/accounting/useImportExcel"
import { exportExcel } from "../modules/accounting/sheetjs"
import { formatDataSummary } from "../modules/accounting/helpers"
import type { CashRecord } from "../modules/accounting/types"

export default function Accounting() {
  const { records, activeTab, importDialog, setRecords, addRecords, hideImportDialog, switchTab } = useAccountingStore()
  const { propertiesVisible, setPropertiesVisible, setReimburseRecords } = useDocSettingsStore()
  const { importFromClipboard } = useImportClipboard()
  const { triggerImport, inputRef, handleFileChange } = useImportExcel()
  const [sheetsBatch, setSheetsBatch] = useState<string[]>([])

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

  const summary = formatDataSummary(records)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="no-print" style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => switchTab("sheets")}
              style={{
                padding: "6px 16px",
                fontSize: 12,
                border: "none",
                background: activeTab === "sheets" ? "var(--bg-active)" : "transparent",
                color: activeTab === "sheets" ? "var(--text)" : "var(--text-dim)",
                cursor: "pointer",
                borderBottom: activeTab === "sheets" ? "2px solid var(--accent)" : "2px solid transparent",
                fontWeight: activeTab === "sheets" ? 600 : 400,
              }}
            >
            数据源
          </button>
          <button
            onClick={() => switchTab("preview")}
            style={{
              padding: "6px 16px",
              fontSize: 12,
              border: "none",
              background: activeTab === "preview" ? "var(--bg-active)" : "transparent",
              color: activeTab === "preview" ? "var(--text)" : "var(--text-dim)",
              cursor: "pointer",
              borderBottom: activeTab === "preview" ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: activeTab === "preview" ? 600 : 400,
            }}
          >
            数据预览
          </button>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px" }}>
          <Tooltip content="从 Excel 导入">
            <Button icon="import" text="Excel" onClick={triggerImport} small />
          </Tooltip>
          <Tooltip content="从剪贴板粘贴">
            <Button icon="clipboard" text="粘贴" onClick={handleClipboard} small />
          </Tooltip>
          <Tooltip content="导出为 Excel">
            <Button icon="export" text="导出" onClick={handleExport} small />
          </Tooltip>
          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 4px" }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>{summary}</span>
          <Tooltip content={propertiesVisible ? "关闭打印设置" : "打开打印设置"}>
            <Button
              icon="print"
              intent={propertiesVisible ? "primary" : "none"}
              onClick={() => setPropertiesVisible(v => !v)}
              small
            />
          </Tooltip>
        </div>

        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleExcel} style={{ display: "none" }} title="导入Excel文件" aria-label="导入Excel文件" />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: activeTab === "sheets" ? "flex" : "none", height: "100%" }}>
          <SheetsDataTab batch={sheetsBatch} onBatchChange={setSheetsBatch} />
        </div>
        <div style={{ display: activeTab === "preview" ? "flex" : "none", height: "100%" }}>
          <CashGrid records={records} />
        </div>
      </div>

      <ImportDialog
        open={importDialog.open}
        records={importDialog.importRecord?.records || []}
        onConfirm={handleConfirmImport}
        onCancel={hideImportDialog}
      />
    </div>
  )
}
