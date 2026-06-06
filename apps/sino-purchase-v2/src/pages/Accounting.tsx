import { useState, useEffect, useCallback } from "react"
import { AccountingProvider, useAccounting } from "./accounting/AccountingContext"
import { useDocSettings } from "../context/DocSettingsContext"
import { SPREADSHEET_ID } from "../config/sheets"
import CashGrid from "./accounting/CashGrid"
import ImportDialog from "./accounting/ImportDialog"
import Toolbar from "./accounting/Toolbar"
import SheetsViewer from "../components/SheetsViewer"
import type { CashRecord } from "./accounting/types"

function AccountingContent() {
  const { state, addRecords, hideImportDialog } = useAccounting()
  const { setReimburseRecords } = useDocSettings()
  const [showSheets, setShowSheets] = useState(false)

  useEffect(() => {
    setReimburseRecords(state.records)
  }, [state.records, setReimburseRecords])

  const handleConfirmImport = useCallback((records: CashRecord[]) => {
    if (records.length > 0) {
      addRecords(records)
    }
    hideImportDialog()
  }, [addRecords, hideImportDialog])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Toolbar
        records={state.records}
        showSheets={showSheets}
        onSheetsToggle={() => setShowSheets((v) => !v)}
      />

      <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <CashGrid records={state.records} />
        </div>

        {showSheets && (
          <div style={{ width: "50%", overflow: "auto", borderLeft: "1px solid var(--border)" }}>
            <SheetsViewer spreadsheetId={SPREADSHEET_ID} />
          </div>
        )}
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
