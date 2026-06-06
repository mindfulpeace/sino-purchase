import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

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
}

const DocSettingsContext = createContext<DocSettingsContextValue | null>(null)

export function DocSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DocSettings>({
    companyName: "中矿新元矿业有限公司",
    companyNameEn: "Sino Xinyuan Mining company Limited",
    applicant: "任金涛",
  })

  const setCompanyName = useCallback((companyName: string) => setSettings((s) => ({ ...s, companyName })), [])
  const setCompanyNameEn = useCallback((companyNameEn: string) => setSettings((s) => ({ ...s, companyNameEn })), [])
  const setApplicant = useCallback((applicant: string) => setSettings((s) => ({ ...s, applicant })), [])

  return (
    <DocSettingsContext.Provider value={{ settings, setCompanyName, setCompanyNameEn, setApplicant }}>
      {children}
    </DocSettingsContext.Provider>
  )
}

export function useDocSettings() {
  const ctx = useContext(DocSettingsContext)
  if (!ctx) throw new Error("useDocSettings must be used within DocSettingsProvider")
  return ctx
}
