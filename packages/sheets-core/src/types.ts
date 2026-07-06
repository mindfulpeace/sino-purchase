export interface SheetsConfig {
  clientId: string
  spreadsheetId: string
  scope?: string
}

export interface SyncOp {
  sheet: string
  op: "insert" | "update" | "delete"
  data?: Record<string, unknown>
  rowIndex?: number
  headers?: string[]
}

export type SyncStatus = "synced" | "syncing" | "unsynced"

export interface SheetConfig<T> {
  name: string
  headers: (keyof T)[]
  numericFields?: Set<keyof T>
  dateFields?: Set<keyof T>
}
