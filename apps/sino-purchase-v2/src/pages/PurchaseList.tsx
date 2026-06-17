import { useCallback } from "react"
import { Cell, Column, Table2 } from "@blueprintjs/table"
import { NonIdealState } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import type { PurchaseTask } from "../modules/plan/types"
import { STATUS_LABEL_CN, STATUS_BADGE, currencySymbol } from "../modules/plan/types"
import { usePlanStore } from "../app/stores/planStore"

const URGENCY_COLORS: Record<number, string> = {
  1: "#9e9e9e",
  2: "#4caf50",
  3: "#ff9800",
  4: "#ff5722",
  5: "#f44336",
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
      columnWidths={[120, 80, 100, 70, 50, 80, 80, 60, 90]}
    >
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
        const task = tasks[rowIndex]
        return <Cell>{task?.brand}</Cell>
      }} />
      <Column name="规格" cellRenderer={(rowIndex) => {
        const task = tasks[rowIndex]
        return <Cell>{task?.spec}</Cell>
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
        const task = tasks[rowIndex]
        return <Cell>{task?.taxStatus}</Cell>
      }} />
      <Column name="状态" cellRenderer={(rowIndex) => {
        const task = tasks[rowIndex]
        if (!task) return <Cell />
        const label = STATUS_LABEL_CN[task.status] ?? "-"
        const badge = STATUS_BADGE[task.status] ?? ""
        return (
          <Cell>
            <span style={{
              display: "inline-block",
              padding: "1px 6px",
              borderRadius: 4,
              fontSize: 11,
              background: task.status === 4 ? "rgba(244,67,54,0.15)" : task.status === 5 ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.08)",
              color: task.status === 4 ? "#f44336" : task.status === 5 ? "#4caf50" : "inherit",
            }}>
              {badge} {label}
            </span>
          </Cell>
        )
      }} />
      <Column name="紧急" cellRenderer={(rowIndex) => {
        const task = tasks[rowIndex]
        const color = task ? URGENCY_COLORS[task.urgency] ?? "#9e9e9e" : "#9e9e9e"
        return (
          <Cell>
            <span style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              marginRight: 4,
              verticalAlign: "middle",
            }} />
            {task?.urgency}
          </Cell>
        )
      }} />
      <Column name="预定日期" cellRenderer={(rowIndex) => {
        const task = tasks[rowIndex]
        return <Cell>{task?.plannedDate}</Cell>
      }} />
    </Table2>
  )
}
