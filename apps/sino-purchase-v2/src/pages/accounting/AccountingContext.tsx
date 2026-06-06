import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"
import type { CashRecord, ImportRecord, ImportDialogState } from "./types"

interface AccountingState {
  records: CashRecord[]
  importDialog: ImportDialogState
  activeTab: "sheets" | "preview"
}

type AccountingAction =
  | { type: "SET_RECORDS"; records: CashRecord[] }
  | { type: "ADD_RECORDS"; records: CashRecord[] }
  | { type: "UPDATE_RECORD"; id: string; field: keyof CashRecord; value: string | number }
  | { type: "SHOW_IMPORT_DIALOG"; importRecord: ImportRecord }
  | { type: "HIDE_IMPORT_DIALOG" }
  | { type: "SWITCH_TAB"; tab: "sheets" | "preview" }

function reducer(state: AccountingState, action: AccountingAction): AccountingState {
  switch (action.type) {
    case "SET_RECORDS":
      return { ...state, records: action.records }
    case "ADD_RECORDS":
      return { ...state, records: [...action.records, ...state.records] }
    case "UPDATE_RECORD":
      return {
        ...state,
        records: state.records.map((r) =>
          r.id === action.id ? { ...r, [action.field]: action.value } : r,
        ),
      }
    case "SHOW_IMPORT_DIALOG":
      return { ...state, importDialog: { open: true, importRecord: action.importRecord } }
    case "HIDE_IMPORT_DIALOG":
      return { ...state, importDialog: { open: false, importRecord: null } }
    case "SWITCH_TAB":
      return { ...state, activeTab: action.tab }
    default:
      return state
  }
}

const initialState: AccountingState = {
  records: [],
  importDialog: { open: false, importRecord: null },
  activeTab: "preview",
}

interface AccountingContextValue {
  state: AccountingState
  setRecords: (records: CashRecord[]) => void
  addRecords: (records: CashRecord[]) => void
  updateRecord: (id: string, field: keyof CashRecord, value: string | number) => void
  showImportDialog: (importRecord: ImportRecord) => void
  hideImportDialog: () => void
  switchTab: (tab: "sheets" | "preview") => void
}

const AccountingContext = createContext<AccountingContextValue | null>(null)

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setRecords = useCallback((records: CashRecord[]) => dispatch({ type: "SET_RECORDS", records }), [])
  const addRecords = useCallback((records: CashRecord[]) => dispatch({ type: "ADD_RECORDS", records }), [])
  const updateRecord = useCallback(
    (id: string, field: keyof CashRecord, value: string | number) =>
      dispatch({ type: "UPDATE_RECORD", id, field, value }),
    [],
  )
  const showImportDialog = useCallback(
    (importRecord: ImportRecord) => dispatch({ type: "SHOW_IMPORT_DIALOG", importRecord }),
    [],
  )
  const hideImportDialog = useCallback(() => dispatch({ type: "HIDE_IMPORT_DIALOG" }), [])
  const switchTab = useCallback((tab: "sheets" | "preview") => dispatch({ type: "SWITCH_TAB", tab }), [])

  return (
    <AccountingContext.Provider value={{ state, setRecords, addRecords, updateRecord, showImportDialog, hideImportDialog, switchTab }}>
      {children}
    </AccountingContext.Provider>
  )
}

export function useAccounting() {
  const ctx = useContext(AccountingContext)
  if (!ctx) throw new Error("useAccounting must be used within AccountingProvider")
  return ctx
}
