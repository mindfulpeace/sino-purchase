import { create } from "zustand"
import type { CashRecord, ImportRecord } from "../../modules/accounting/types"

interface AccountingState {
  records: CashRecord[]
  activeTab: "sheets" | "preview"
  importDialog: { open: boolean; importRecord: ImportRecord | null }

  setRecords: (records: CashRecord[]) => void
  addRecords: (records: CashRecord[]) => void
  updateRecord: (id: string, field: keyof CashRecord, value: string | number) => void
  deleteRecords: (ids: string[]) => void
  showImportDialog: (importRecord: ImportRecord) => void
  hideImportDialog: () => void
  switchTab: (tab: "sheets" | "preview") => void
}

export const useAccountingStore = create<AccountingState>((set) => ({
  records: [],
  activeTab: "preview",
  importDialog: { open: false, importRecord: null },

  setRecords: (records) => set({ records }),
  addRecords: (records) => set((s) => ({ records: [...records, ...s.records] })),
  updateRecord: (id, field, value) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    })),
  deleteRecords: (ids) =>
    set((s) => ({ records: s.records.filter((r) => !ids.includes(r.id)) })),
  showImportDialog: (importRecord) => set({ importDialog: { open: true, importRecord } }),
  hideImportDialog: () => set({ importDialog: { open: false, importRecord: null } }),
  switchTab: (tab) => set({ activeTab: tab }),
}))
