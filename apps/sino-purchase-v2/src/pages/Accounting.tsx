import { useEffect, useCallback, useState } from "react"
import { Button, Tooltip } from "@blueprintjs/core"
import { AccountingProvider, useAccounting } from "./accounting/AccountingContext"
import { useDocSettings } from "../context/DocSettingsContext"
import CashGrid from "./accounting/CashGrid"
import ImportDialog from "./accounting/ImportDialog"
import SheetsDataTab from "./accounting/SheetsDataTab"
import { useImportClipboard } from "./accounting/useImportClipboard"
import { useImportExcel } from "./accounting/useImportExcel"
import { exportExcel } from "./accounting/sheetjs"
import { formatDataSummary } from "./accounting/helpers"
import type { CashRecord } from "./accounting/types"

function AccountingContent() {
  const { state, setRecords, addRecords, hideImportDialog, switchTab } = useAccounting()
  const { propertiesVisible, setPropertiesVisible, setReimburseRecords } = useDocSettings()
  const { importFromClipboard } = useImportClipboard()
  const { triggerImport, inputRef, handleFileChange } = useImportExcel()
  const [sheetsBatch, setSheetsBatch] = useState<string[]>([])

  useEffect(() => {
    setReimburseRecords(state.records)
  }, [state.records])

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
      await exportExcel(state.records)
    } catch {
      alert("导出失败")
    }
  }, [state.records])

  const handleConfirmImport = useCallback((records: CashRecord[], mode: "append" | "replace") => {
    if (records.length > 0) {
      if (mode === "replace") setRecords(records)
      else addRecords(records)
    }
    hideImportDialog()
    switchTab("preview")
  }, [setRecords, addRecords, hideImportDialog, switchTab])

  const summary = formatDataSummary(state.records)

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
              background: state.activeTab === "sheets" ? "var(--bg-active)" : "transparent",
              color: state.activeTab === "sheets" ? "var(--text)" : "var(--text-dim)",
              cursor: "pointer",
              borderBottom: state.activeTab === "sheets" ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: state.activeTab === "sheets" ? 600 : 400,
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
              background: state.activeTab === "preview" ? "var(--bg-active)" : "transparent",
              color: state.activeTab === "preview" ? "var(--text)" : "var(--text-dim)",
              cursor: "pointer",
              borderBottom: state.activeTab === "preview" ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: state.activeTab === "preview" ? 600 : 400,
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
              text="打印设置"
              intent={propertiesVisible ? "primary" : "none"}
              onClick={() => setPropertiesVisible(v => !v)}
              small
            />
          </Tooltip>
        </div>

        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleExcel} style={{ display: "none" }} />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: state.activeTab === "sheets" ? "flex" : "none", height: "100%" }}>
          <SheetsDataTab batch={sheetsBatch} onBatchChange={setSheetsBatch} />
        </div>
        <div style={{ display: state.activeTab === "preview" ? "flex" : "none", height: "100%" }}>
          <CashGrid records={state.records} />
        </div>
      </div>

      <ImportDialog
        open={state.importDialog.open}
        records={state.importDialog.importRecord?.records || []}
        onConfirm={handleConfirmImport}
        onCancel={hideImportDialog}
      />
    </div>
  )
}

export default function Accounting() {
  return (
    <AccountingProvider>
      <AccountingContent />
    </AccountingProvider>
  )
}
