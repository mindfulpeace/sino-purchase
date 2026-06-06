import { Dialog, Button, Classes } from "@blueprintjs/core"
import type { CashRecord } from "./types"
import { formatAmount } from "./helpers"

interface ImportDialogProps {
  open: boolean
  records: CashRecord[]
  onConfirm: () => void
  onCancel: () => void
}

export default function ImportDialog({ open, records, onConfirm, onCancel }: ImportDialogProps) {
  const count = records.length
  const total = records.reduce((sum, r) => sum + (r.amount || 0), 0)

  return (
    <Dialog
      isOpen={open}
      onClose={onCancel}
      title={`导入确认 — ${count} 条记录，合计 ${formatAmount(total)}`}
      style={{ width: 700 }}
    >
      <div className={Classes.DIALOG_BODY} style={{ maxHeight: 400, overflow: "auto", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-hover)", position: "sticky", top: 0 }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>日期</th>
              <th style={thStyle}>税务</th>
              <th style={thStyle}>描述</th>
              <th style={thStyle}>金额</th>
              <th style={thStyle}>类型</th>
              <th style={thStyle}>批次</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={tdStyle}>{row.id.slice(0, 8)}</td>
                <td style={tdStyle}>{row.date}</td>
                <td style={tdStyle}>{row.tax}</td>
                <td style={{ ...tdStyle, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.description}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>{formatAmount(row.amount)}</td>
                <td style={tdStyle}>{row.type}</td>
                <td style={tdStyle}>{row.batch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={onConfirm} intent="primary">确认导入</Button>
        </div>
      </div>
    </Dialog>
  )
}

const thStyle: React.CSSProperties = {
  padding: "6px 8px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}

const tdStyle: React.CSSProperties = {
  padding: "4px 8px",
  verticalAlign: "top",
}
