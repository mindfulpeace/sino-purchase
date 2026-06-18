import { useCallback } from "react"
import { Cell, Column, Table2 } from "@blueprintjs/table"
import { Icon, NonIdealState } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import type { PurchaseTask } from "../modules/plan/types"
import { currencySymbol } from "../modules/plan/types"
import { usePlanStore } from "../app/stores/planStore"

const URGENCY_COLORS: Record<number, string> = {
  1: "#9e9e9e",
  2: "#4caf50",
  3: "#ff9800",
  4: "#ff5722",
  5: "#f44336",
}

const STATUS_ICONS: Record<number, typeof IconNames[keyof typeof IconNames]> = {
  1: IconNames.MINUS,
  2: IconNames.PLUS,
  3: IconNames.TICK,
  4: IconNames.CROSS,
  5: IconNames.TICK_CIRCLE,
}

const STATUS_COLORS: Record<number, string> = {
  1: "#9e9e9e",
  2: "#2196f3",
  3: "#4caf50",
  4: "#f44336",
  5: "#ff9800",
}

interface PurchaseListProps {
  tasks: PurchaseTask[]
}

export function PurchaseList({ tasks }: PurchaseListProps) {
  const handleRowClick = useCallback((rowIndex: number) => {
    const task = tasks[rowIndex]
    if (task) {
      const { onToggleSelect } = usePlanStore.getState()
      onToggleSelect(task.id)
    }
  }, [tasks])

  const handleRowDoubleClick = useCallback((rowIndex: number) => {
    const task = tasks[rowIndex]
    if (task) {
      const { setEditingTaskId, setIsAdding, setBatchEdit } = usePlanStore.getState()
      setIsAdding(false)
      setBatchEdit(false)
      setEditingTaskId(task.id)
    }
  }, [tasks])

  if (tasks.length === 0) {
    return (
      <NonIdealState
        icon={IconNames.INBOX}
        title="暂无数据"
        description="点击下方按钮添加采购任务"
      />
    )
  }

  return (
    <Table2
      numRows={tasks.length}
      enableGhostCells={false}
      enableRowHeader={false}
      enableVerticalScrollbar={true}
      columnWidths={[48, 120, 80, 100, 70, 50, 80, 90]}
    >
      <Column name="" cellRenderer={(rowIndex) => {
        const task = tasks[rowIndex]
        if (!task) return <Cell />
        const iconName = STATUS_ICONS[task.status] ?? IconNames.HELP
        const sColor = STATUS_COLORS[task.status] ?? "#9e9e9e"
        const uColor = URGENCY_COLORS[task.urgency] ?? "#9e9e9e"
        return (
          <Cell>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon icon={iconName} size={14} color={sColor} />
              <span style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: uColor,
              }} />
            </span>
          </Cell>
        )
      }} />
      <Column name="品名" cellRenderer={(rowIndex) => (
        <Cell>
          <div
            style={{ cursor: "pointer", width: "100%", height: "100%", padding: "0 4px" }}
            onClick={() => handleRowClick(rowIndex)}
            onDoubleClick={() => handleRowDoubleClick(rowIndex)}
          >
            {tasks[rowIndex]?.name}
          </div>
        </Cell>
      )} />
      <Column name="品牌" cellRenderer={(rowIndex) => {
        return <Cell>{tasks[rowIndex]?.brand}</Cell>
      }} />
      <Column name="规格" cellRenderer={(rowIndex) => {
        return <Cell>{tasks[rowIndex]?.spec}</Cell>
      }} />
      <Column name="数量" cellRenderer={(rowIndex) => {
        const task = tasks[rowIndex]
        return <Cell>{task?.quantity} {task?.unit}</Cell>
      }} />
      <Column name="单价" cellRenderer={(rowIndex) => {
        const task = tasks[rowIndex]
        const sym = task ? currencySymbol(task.currency) : ""
        return <Cell>{sym}{task?.unitPrice?.toFixed(2)}</Cell>
      }} />
      <Column name="税务" cellRenderer={(rowIndex) => {
        return <Cell>{tasks[rowIndex]?.taxStatus}</Cell>
      }} />
      <Column name="预定日期" cellRenderer={(rowIndex) => {
        return <Cell>{tasks[rowIndex]?.plannedDate}</Cell>
      }} />
    </Table2>
  )
}
