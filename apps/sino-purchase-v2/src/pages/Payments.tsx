import { useState } from "react"
import { Button, Card, H3, HTMLTable, Tag, Intent } from "@blueprintjs/core"

interface Payment {
  id: string
  date: string
  supplier: string
  amount: number
  status: "pending" | "paid" | "cancelled"
  reference: string
}

const samplePayments: Payment[] = [
  { id: "1", date: "2024-06-10", supplier: "钢铁供应商 A", amount: 55000, status: "paid", reference: "PAY-001" },
  { id: "2", date: "2024-06-12", supplier: "铝材供应商 B", amount: 18000, status: "pending", reference: "PAY-002" },
  { id: "3", date: "2024-06-15", supplier: "标准件供应商 C", amount: 1500, status: "pending", reference: "PAY-003" },
  { id: "4", date: "2024-06-05", supplier: "运输公司 D", amount: 2000, status: "paid", reference: "PAY-004" },
]

const statusMap: Record<Payment["status"], { label: string; intent: Intent }> = {
  pending: { label: "待付款", intent: Intent.WARNING },
  paid: { label: "已付款", intent: Intent.SUCCESS },
  cancelled: { label: "已取消", intent: Intent.DANGER },
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>(samplePayments)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <H3>往来付款</H3>
        <Button intent="primary" icon="plus">
          新增付款
        </Button>
      </div>

      <Card>
        <HTMLTable compact striped style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>付款单号</th>
              <th>日期</th>
              <th>供应商</th>
              <th>金额</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => {
              const statusInfo = statusMap[p.status]
              return (
                <tr key={p.id}>
                  <td>{p.reference}</td>
                  <td>{p.date}</td>
                  <td>{p.supplier}</td>
                  <td>{p.amount.toLocaleString()}</td>
                  <td>
                    <Tag intent={statusInfo.intent}>{statusInfo.label}</Tag>
                  </td>
                  <td>
                    <Button small minimal icon="eye">查看</Button>
                    {p.status === "pending" && (
                      <Button small minimal intent="success" icon="tick" style={{ marginLeft: 8 }}>
                        确认付款
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </HTMLTable>
      </Card>

      <div style={{ marginTop: 24, color: "var(--text-dim)", fontSize: 14 }}>
        <p>💡 提示：此页面当前为演示数据，未来将接入 Google Sheets 同步。</p>
      </div>
    </div>
  )
}
