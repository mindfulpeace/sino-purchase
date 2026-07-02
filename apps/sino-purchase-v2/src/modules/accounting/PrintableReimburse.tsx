import { DocReimburse } from "@sino-purchase/doc"
import { PrintView, PrintPaper } from "@sino-purchase/print"
import { useReimburseData } from "./useReimburseData"
import type { CashRecord } from "./types"

interface PrintableReimburseProps {
  records: CashRecord[]
  applicant: string
  companyName?: string
  companyNameEn?: string
  /** 自动配置公司名称：开启后按批次长度决定每页公司名，忽略传入的 companyName */
  autoCompany?: boolean
}

/** 批次长度 → 公司名映射 */
const COMPANY_BY_BATCH_LEN: Record<number, { cn: string; en: string }> = {
  1: { cn: "中矿新元矿业有限公司", en: "Sino Xinyuan Mining company Limited" },
  2: { cn: "海神投资有限公司", en: "MARINUS INVESTMENTS LIMITED" },
}

export default function PrintableReimburse({ records, applicant, companyName, companyNameEn, autoCompany }: PrintableReimburseProps) {
  const { reimburseData } = useReimburseData(records)

  if (reimburseData.length === 0) {
    return (<div style={{ padding: 24, color: "var(--text-dim)", textAlign: "center" }}>暂无批次数据，请先导入带批次的数据</div>)
  }

  return (
    <PrintView>
      {reimburseData.map((d, index) => {
        const company = autoCompany
          ? (COMPANY_BY_BATCH_LEN[d.batch.length] ?? COMPANY_BY_BATCH_LEN[2])
          : { cn: companyName, en: companyNameEn }
        return (
          <PrintPaper key={index}>
            <div style={{ color: "#999", marginBottom: 8, fontSize: 12 }}>{d.tax}{d.batch ? ` - ${d.batch}` : ""}</div>
            <DocReimburse date={d.date} items={d.items} applicant={applicant} companyName={company.cn} companyNameEn={company.en} />
          </PrintPaper>
        )
      })}
    </PrintView>
  )
}
