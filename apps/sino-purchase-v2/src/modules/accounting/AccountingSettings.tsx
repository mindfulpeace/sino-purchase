import { useCallback } from "react"
import { Button, InputGroup, Select, Switch, IconNames, Box, Stack } from "../../components/ui"
import { useDocSettingsStore } from "../../app/stores/docSettingsStore"
import { PrintPreview } from "@sino-purchase/print"
import PrintableReimburse from "./PrintableReimburse"

interface CompanyPreset {
  label: string
  companyName: string
  companyNameEn: string
}

const PRESETS: CompanyPreset[] = [
  { label: "中矿新元矿业有限公司", companyName: "中矿新元矿业有限公司", companyNameEn: "Sino Xinyuan Mining company Limited" },
  { label: "海神投资有限公司", companyName: "海神投资有限公司", companyNameEn: "MARINUS INVESTMENTS LIMITED" },
]

function findPresetIndex(cn: string, en: string): number {
  return PRESETS.findIndex(p => p.companyName === cn && p.companyNameEn === en)
}

export default function AccountingSettings() {
  const { settings, autoCompany, setCompanyName, setCompanyNameEn, setApplicant, setAutoCompany, reimburseRecords } = useDocSettingsStore()

  const presetIndex = findPresetIndex(settings.companyName, settings.companyNameEn)
  const isCustom = presetIndex === -1

  const handlePresetChange = useCallback((value: string) => {
    const idx = parseInt(value, 10)
    if (idx >= 0 && idx < PRESETS.length) {
      setCompanyName(PRESETS[idx].companyName)
      setCompanyNameEn(PRESETS[idx].companyNameEn)
    }
  }, [setCompanyName, setCompanyNameEn])

  const handlePrint = () => { window.print() }

  return (
    <Stack spacing={1} sx={{ height: "100%", overflow: "hidden", p: 1.5 }}>
      <Box className="no-print" sx={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
        <Switch checked={autoCompany} label="自动配置公司名称" onChange={(e) => setAutoCompany(e.currentTarget.checked)} />
        <Select
          value={isCustom ? "-1" : String(presetIndex)}
          options={[
            ...PRESETS.map((p, i) => ({ value: String(i), label: p.label })),
            { value: "-1", label: "自定义" },
          ]}
          onChange={handlePresetChange}
          disabled={autoCompany}
          style={{ width: "100%" }}
        />
        <InputGroup placeholder="公司名(中文)" value={settings.companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={autoCompany} />
        <InputGroup placeholder="公司名(英文)" value={settings.companyNameEn} onChange={(e) => setCompanyNameEn(e.target.value)} disabled={autoCompany} />
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          <Box sx={{ flex: 0.7 }}>
            <InputGroup placeholder="申请人" value={settings.applicant} onChange={(e) => setApplicant(e.target.value)} />
          </Box>
          <Box sx={{ flex: 0.3 }}>
            <Button icon={IconNames.PRINT} text="打印" intent="primary" onClick={handlePrint} fill />
          </Box>
        </Stack>
      </Box>
      {reimburseRecords.length > 0 && (
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, minWidth: 0 }}>
          <PrintPreview>
            <PrintableReimburse
              records={reimburseRecords}
              applicant={settings.applicant}
              companyName={settings.companyName}
              companyNameEn={settings.companyNameEn}
              autoCompany={autoCompany}
            />
          </PrintPreview>
        </Box>
      )}
    </Stack>
  )
}
