import { useEffect, useCallback } from "react"
import { AccountingProvider, useAccounting } from "./accounting/AccountingContext"
import { useDocSettings } from "../context/DocSettingsContext"
import CashGrid from "./accounting/CashGrid"
import ImportDialog from "./accounting/ImportDialog"
import Toolbar from "./accounting/Toolbar"
import type { CashRecord } from "./accounting/types"

function AccountingContent() {
  const { state, addRecords, hideImportDialog } = useAccounting()
  const { settings, showPrint, toggleShowPrint, setReimburseRecords } = useDocSettings()

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
        onPrintToggle={toggleShowPrint}
        showPrint={showPrint}
      />

      <div style={{ flex: 1, overflow: "auto" }}>
        <CashGrid records={state.records} />
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
