import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { CashRecord } from "../pages/accounting/types"

interface DocSettings {
  companyName: string
  companyNameEn: string
  applicant: string
}

interface DocSettingsContextValue {
  settings: DocSettings
  setCompanyName: (name: string) => void
  setCompanyNameEn: (name: string) => void
  setApplicant: (name: string) => void
  showPrint: boolean
  toggleShowPrint: () => void
  setShowPrint: (v: boolean) => void
  reimburseRecords: CashRecord[]
  setReimburseRecords: (records: CashRecord[]) => void
}

const DocSettingsContext = createContext<DocSettingsContextValue | null>(null)

export function DocSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DocSettings>({
    companyName: "中矿新元矿业有限公司",
    companyNameEn: "Sino Xinyuan Mining company Limited",
    applicant: "任金涛",
  })
  const [showPrint, setShowPrint] = useState(false)
  const [reimburseRecords, setReimburseRecords] = useState<CashRecord[]>([])

  const setCompanyName = useCallback((companyName: string) => setSettings((s) => ({ ...s, companyName })), [])
  const setCompanyNameEn = useCallback((companyNameEn: string) => setSettings((s) => ({ ...s, companyNameEn })), [])
  const setApplicant = useCallback((applicant: string) => setSettings((s) => ({ ...s, applicant })), [])
  const toggleShowPrint = useCallback(() => setShowPrint((v) => !v), [])

  return (
    <DocSettingsContext.Provider value={{ settings, setCompanyName, setCompanyNameEn, setApplicant, showPrint, toggleShowPrint, setShowPrint, reimburseRecords, setReimburseRecords }}>
      {children}
    </DocSettingsContext.Provider>
  )
}

export function useDocSettings() {
  const ctx = useContext(DocSettingsContext)
  if (!ctx) throw new Error("useDocSettings must be used within DocSettingsProvider")
  return ctx
}
