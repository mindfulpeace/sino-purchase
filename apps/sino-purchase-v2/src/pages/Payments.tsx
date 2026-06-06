import { useState } from "react"
import { Button, Card, H3, HTMLTable, Tag, Intent } from "@blueprintjs/core"
import { usePaymentStore } from "../app/stores/paymentStore"

const statusMap: Record<string, { label: string; intent: Intent }> = {
  pending: { label: "待付款", intent: Intent.WARNING },
  paid: { label: "已付款", intent: Intent.SUCCESS },
  cancelled: { label: "已取消", intent: Intent.DANGER },
}

export default function Payments() {
  const { payments, deletePayment, confirmPayment, cancelPayment } = usePaymentStore()
  const [search, setSearch] = useState("")

  const filtered = payments.filter(p =>
    search ? p.supplier.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <H3>往来付款</H3>
        <input
          placeholder="搜索供应商/单号..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
            fontSize: 13,
            width: 240,
          }}
        />
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-dim)" }}>
                  {search ? "未找到匹配记录" : "暂无付款记录"}
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const info = statusMap[p.status]
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "monospace" }}>{p.reference}</td>
                    <td>{p.date}</td>
                    <td>{p.supplier}</td>
                    <td style={{ textAlign: "right" }}>¥{p.amount.toLocaleString()}</td>
                    <td><Tag intent={info.intent}>{info.label}</Tag></td>
                    <td>
                      {p.status === "pending" && (
                        <>
                          <Button small minimal intent="success" icon="tick" onClick={() => confirmPayment(p.id)} />
                          <Button small minimal intent="danger" icon="cross" style={{ marginLeft: 4 }} onClick={() => cancelPayment(p.id)} />
                        </>
                      )}
                      {(p.status === "paid" || p.status === "cancelled") && (
                        <Button small minimal icon="trash" intent="danger" onClick={() => deletePayment(p.id)} />
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </HTMLTable>
      </Card>

      <div style={{ marginTop: 24, color: "var(--text-dim)", fontSize: 14 }}>
        <p>💡 数据已持久化到 localStorage</p>
      </div>
    </div>
  )
}
