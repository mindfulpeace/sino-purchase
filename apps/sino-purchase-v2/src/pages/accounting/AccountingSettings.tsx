import { useCallback } from "react"
import { Button, InputGroup, HTMLSelect } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useDocSettings } from "../../context/DocSettingsContext"
import PrintableReimburse from "./PrintableReimburse"

interface CompanyPreset {
  label: string
  companyName: string
  companyNameEn: string
}

const PRESETS: CompanyPreset[] = [
  { label: "中矿新元矿业有限公司", companyName: "中矿新元矿业有限公司", companyNameEn: "Sino Xinyuan Mining company Limited" },
  { label: "玛瑞纳斯投资有限公司", companyName: "玛瑞纳斯投资有限公司", companyNameEn: "MARINUS INVESTMENTS LIMITED" },
]

function findPresetIndex(cn: string, en: string): number {
  return PRESETS.findIndex(p => p.companyName === cn && p.companyNameEn === en)
}

export default function AccountingSettings() {
  const { settings, setCompanyName, setCompanyNameEn, setApplicant, reimburseRecords } = useDocSettings()

  const presetIndex = findPresetIndex(settings.companyName, settings.companyNameEn)
  const isCustom = presetIndex === -1

  const handlePresetChange = useCallback((value: string) => {
    const idx = parseInt(value, 10)
    if (idx >= 0 && idx < PRESETS.length) {
      setCompanyName(PRESETS[idx].companyName)
      setCompanyNameEn(PRESETS[idx].companyNameEn)
    }
  }, [setCompanyName, setCompanyNameEn])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "hidden", padding: 12 }}>
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        <HTMLSelect value={isCustom ? "-1" : String(presetIndex)} onChange={e => handlePresetChange(e.target.value)} fill>
          {PRESETS.map((p, i) => (
            <option key={i} value={String(i)}>{p.label}</option>
          ))}
          <option value="-1">自定义</option>
        </HTMLSelect>
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
