export interface CashRecord {
  id: string
  date: string
  description: string
  amount: number
  tax: string
  type: string
  batch: string
  note: string
}

export interface ImportRecord {
  records: CashRecord[]
  source: "clipboard" | "excel"
}

export interface ImportDialogState {
  open: boolean
  importRecord: ImportRecord | null
}
