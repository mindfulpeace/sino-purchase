import { InputGroup } from "@blueprintjs/core"
import { useDocSettings } from "../../context/DocSettingsContext"

export default function AccountingSettings() {
  const { settings, setCompanyName, setCompanyNameEn, setApplicant } = useDocSettings()

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <InputGroup
        placeholder="公司名(中文)"
        value={settings.companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <InputGroup
        placeholder="Company Name"
        value={settings.companyNameEn}
        onChange={(e) => setCompanyNameEn(e.target.value)}
      />
      <InputGroup
        placeholder="申请人"
        value={settings.applicant}
        onChange={(e) => setApplicant(e.target.value)}
      />
    </div>
  )
}
