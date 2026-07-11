import { useState, useRef } from "react"
import { Button, ButtonGroup, InputGroup, Icon, IconNames, Box } from "../../../components/ui"
import type { PurchaseTask } from "../types"
import { defaultTaskFields } from "../helpers"

interface Props {
  onAdd: (data: Partial<PurchaseTask>) => void
  onOpenAdd: () => void
  onBatch: () => void
}

const defaultInitial: Partial<PurchaseTask> = { name: "", ...defaultTaskFields() }

export function AddNewTaskBar({ onAdd, onOpenAdd, onBatch }: Props) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); if (text.trim()) { onAdd({ ...defaultInitial, name: text.trim() }); setText("") } }
  }

  return (
    <Box style={{ display: "flex", gap: "4px", alignItems: "center", flex: 1 }}>
      <InputGroup inputRef={inputRef} placeholder="品名 回车快速添加" variant="standard" value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} style={{ flex: 1 }} />
      <ButtonGroup size="small">
        <Button icon={<Icon icon={IconNames.NEW_OBJECT} />} onClick={onOpenAdd}>新任务</Button>
        <Button icon={<Icon icon={IconNames.IMPORT} />} onClick={onBatch}>批量</Button>
      </ButtonGroup>
    </Box>
  )
}
