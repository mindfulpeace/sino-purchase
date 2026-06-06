import { useState } from "react"
import { Dialog, Button, InputGroup } from "@blueprintjs/core"
import { todayISO } from "../helpers"

interface Props {
  isOpen: boolean
  field: string
  onConfirm: (date: string) => void
  onClose: () => void
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function DatePickerDialog({ isOpen, field, onConfirm, onClose }: Props) {
  const [tempDate, setTempDate] = useState(todayISO())
  const [pendingClear, setPendingClear] = useState(false)

  function handleOpen() { setTempDate(todayISO()); setPendingClear(false) }

  function handleConfirm() {
    if (pendingClear) onConfirm("")
    else onConfirm(tempDate)
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} onOpening={handleOpen} title={`选择${field === "plannedDate" ? "计划" : field === "receivedDate" ? "入库" : "报销"}日期`} style={{ width: 320 }}>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center" }}>
          <Button small onClick={() => setTempDate(addDays(tempDate, -2))}>-2</Button>
          <Button small onClick={() => setTempDate(addDays(tempDate, -1))}>-1</Button>
          {pendingClear ? (<span style={{ color: "var(--text-dim)", padding: "0 8px" }}>----/--/--</span>) : (
            <InputGroup type="date" value={tempDate} onChange={e => setTempDate(e.target.value)} style={{ width: 160, textAlign: "center" }} />
          )}
          <Button small onClick={() => setTempDate(addDays(tempDate, 1))}>+1</Button>
          <Button small onClick={() => setTempDate(addDays(tempDate, 2))}>+2</Button>
        </div>
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          <Button intent="primary" onClick={handleConfirm}>确定</Button>
          <Button onClick={() => { setTempDate(todayISO()); setPendingClear(false) }}>今日</Button>
          <Button intent="danger" minimal onClick={() => setPendingClear(true)}>清空</Button>
          <Button minimal onClick={onClose}>取消</Button>
        </div>
      </div>
    </Dialog>
  )
}
