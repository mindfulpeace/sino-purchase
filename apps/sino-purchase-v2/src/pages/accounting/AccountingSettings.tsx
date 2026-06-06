import { Button, InputGroup } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useDocSettings } from "../../context/DocSettingsContext"
import PrintableReimburse from "./PrintableReimburse"

export default function AccountingSettings() {
  const { settings, setCompanyName, setCompanyNameEn, setApplicant, reimburseRecords } = useDocSettings()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "hidden", padding: 12 }}>
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
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
        <Button icon={IconNames.PRINT} text="打印" intent="primary" onClick={handlePrint} fill style={{ marginTop: 4 }} />
      </div>
      {reimburseRecords.length > 0 && (
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
          <div className="print-preview-scaler">
            <PrintableReimburse
              records={reimburseRecords}
              applicant={settings.applicant}
              companyName={settings.companyName}
              companyNameEn={settings.companyNameEn}
            />
          </div>
        </div>
      )}
    </div>
  )
}
