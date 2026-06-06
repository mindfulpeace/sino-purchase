import { DocReimburse } from "@sino-purchase/doc"
import { PrintView, PrintPaper } from "@sino-purchase/print"
import { useReimburseData } from "./useReimburseData"
import type { CashRecord } from "./types"

interface PrintableReimburseProps {
  records: CashRecord[]
  applicant: string
}

export default function PrintableReimburse({ records, applicant }: PrintableReimburseProps) {
  const { reimburseData } = useReimburseData(records)

  if (reimburseData.length === 0) {
    return (
      <div style={{ padding: 24, color: "var(--text-dim)", textAlign: "center" }}>
        暂无批次数据，请先导入带批次的数据
      </div>
    )
  }

  return (
    <PrintView zoom={0.5}>
      {reimburseData.map((d, index) => (
        <PrintPaper key={index}>
          <div style={{ color: "#999", marginBottom: 8, fontSize: 12 }}>
            {d.tax}{d.batch ? ` - ${d.batch}` : ""}
          </div>
          <DocReimburse date={d.date} items={d.items} applicant={applicant} />
        </PrintPaper>
      ))}
    </PrintView>
  )
}
