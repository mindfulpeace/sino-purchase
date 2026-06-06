import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"
import type { CashRecord, ImportRecord, ImportDialogState } from "./types"

interface AccountingState {
  records: CashRecord[]
  importDialog: ImportDialogState
}

type AccountingAction =
  | { type: "SET_RECORDS"; records: CashRecord[] }
  | { type: "ADD_RECORDS"; records: CashRecord[] }
  | { type: "SHOW_IMPORT_DIALOG"; importRecord: ImportRecord }
  | { type: "HIDE_IMPORT_DIALOG" }

function reducer(state: AccountingState, action: AccountingAction): AccountingState {
  switch (action.type) {
    case "SET_RECORDS":
      return { ...state, records: action.records }
    case "ADD_RECORDS":
      return { ...state, records: [...action.records, ...state.records] }
    case "SHOW_IMPORT_DIALOG":
      return { ...state, importDialog: { open: true, importRecord: action.importRecord } }
    case "HIDE_IMPORT_DIALOG":
      return { ...state, importDialog: { open: false, importRecord: null } }
    default:
      return state
  }
}

const initialState: AccountingState = {
  records: [],
  importDialog: { open: false, importRecord: null },
}

interface AccountingContextValue {
  state: AccountingState
  setRecords: (records: CashRecord[]) => void
  addRecords: (records: CashRecord[]) => void
  showImportDialog: (importRecord: ImportRecord) => void
  hideImportDialog: () => void
}

const AccountingContext = createContext<AccountingContextValue | null>(null)

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setRecords = useCallback((records: CashRecord[]) => dispatch({ type: "SET_RECORDS", records }), [])
  const addRecords = useCallback((records: CashRecord[]) => dispatch({ type: "ADD_RECORDS", records }), [])
  const showImportDialog = useCallback(
    (importRecord: ImportRecord) => dispatch({ type: "SHOW_IMPORT_DIALOG", importRecord }),
    [],
  )
  const hideImportDialog = useCallback(() => dispatch({ type: "HIDE_IMPORT_DIALOG" }), [])

  return (
    <AccountingContext.Provider value={{ state, setRecords, addRecords, showImportDialog, hideImportDialog }}>
      {children}
    </AccountingContext.Provider>
  )
}

export function useAccounting() {
  const ctx = useContext(AccountingContext)
  if (!ctx) throw new Error("useAccounting must be used within AccountingProvider")
  return ctx
}
