import { useState, useRef } from "react"
import { Button, ButtonGroup, InputGroup, Icon, IconNames } from "../../../components/ui"
import type { PurchaseTask } from "../types"
import { todayISO } from "../helpers"

interface Props {
  onAdd: (data: Partial<PurchaseTask>) => void
  onOpenAdd: () => void
  onBatch: () => void
}

const defaultInitial: Partial<PurchaseTask> = {
  name: "", quantity: 1, unit: "个", urgency: 2,
  currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣",
  plannedDate: todayISO(), status: 1,
}

export function AddNewTaskBar({ onAdd, onOpenAdd, onBatch }: Props) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); if (text.trim()) { onAdd({ ...defaultInitial, name: text.trim() }); setText("") } }
  }

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flex: 1 }}>
      <InputGroup inputRef={inputRef} placeholder="品名 回车快速添加" value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} style={{ flex: 1 }} />
      <ButtonGroup size="small">
        <Button icon={<Icon icon={IconNames.NEW_OBJECT} />} onClick={onOpenAdd}>新任务</Button>
        <Button icon={<Icon icon={IconNames.IMPORT} />} onClick={onBatch}>批量</Button>
      </ButtonGroup>
    </div>
  )
}
