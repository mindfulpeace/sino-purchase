import { create } from "zustand"
import type { CashRecord } from "../../modules/accounting/types"

interface DocSettings {
  companyName: string
  companyNameEn: string
  applicant: string
}

interface DocSettingsState {
  settings: DocSettings
  autoCompany: boolean
  propertiesVisible: boolean
  reimburseRecords: CashRecord[]

  setCompanyName: (name: string) => void
  setCompanyNameEn: (name: string) => void
  setApplicant: (name: string) => void
  setAutoCompany: (v: boolean) => void
  setPropertiesVisible: (v: boolean | ((prev: boolean) => boolean)) => void
  setReimburseRecords: (records: CashRecord[]) => void
}

export const useDocSettingsStore = create<DocSettingsState>((set) => ({
  settings: {
    companyName: "中矿新元矿业有限公司",
    companyNameEn: "Sino Xinyuan Mining company Limited",
    applicant: "任金涛",
  },
  autoCompany: false,
  propertiesVisible: true,
  reimburseRecords: [],

  setCompanyName: (companyName) => set((s) => ({ settings: { ...s.settings, companyName } })),
  setCompanyNameEn: (companyNameEn) => set((s) => ({ settings: { ...s.settings, companyNameEn } })),
  setApplicant: (applicant) => set((s) => ({ settings: { ...s.settings, applicant } })),
  setAutoCompany: (autoCompany) => set({ autoCompany }),
  setPropertiesVisible: (v) =>
    set((s) => ({
      propertiesVisible: typeof v === "function" ? v(s.propertiesVisible) : v,
    })),
  setReimburseRecords: (reimburseRecords) => set({ reimburseRecords }),
}))
