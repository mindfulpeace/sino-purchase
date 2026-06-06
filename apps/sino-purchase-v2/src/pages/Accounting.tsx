import { useState, useCallback } from "react"
import { AccountingProvider, useAccounting } from "./accounting/AccountingContext"
import CashGrid from "./accounting/CashGrid"
import ImportDialog from "./accounting/ImportDialog"
import PrintableReimburse from "./accounting/PrintableReimburse"
import Toolbar from "./accounting/Toolbar"

function AccountingContent() {
  const { state, addRecords, hideImportDialog } = useAccounting()
  const [showPrint, setShowPrint] = useState(false)

  const handleConfirmImport = useCallback(() => {
    if (state.importDialog.importRecord) {
      addRecords(state.importDialog.importRecord.records)
    }
    hideImportDialog()
  }, [state.importDialog.importRecord, addRecords, hideImportDialog])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Toolbar
        records={state.records}
        onPrintToggle={() => setShowPrint((v) => !v)}
        showPrint={showPrint}
      />

      <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <CashGrid records={state.records} />
        </div>

        {showPrint && (
          <div style={{ width: "50%", overflow: "auto", borderLeft: "1px solid var(--border)" }}>
            <PrintableReimburse records={state.records} applicant={state.applicant} />
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
