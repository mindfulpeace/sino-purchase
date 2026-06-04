import { Fragment, useMemo } from "react"
import type { PurchaseTask, GroupBy } from "../types"
import { TaskItem } from "./TaskItem"
import { dateLabel } from "../helpers"

interface Props {
  tasks: PurchaseTask[]
  groupBy: GroupBy
  onRequestEdit: (id: string) => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
}

export function TaskList({ tasks, groupBy, onRequestEdit, selectedIds, onToggleSelect }: Props) {
  const { groups, sortedKeys } = useMemo(() => {
    const g = new Map<string, PurchaseTask[]>()
    const getKey = (t: PurchaseTask): string => {
      switch (groupBy) {
        case "plannedDate": return t.plannedDate || "__none__"
        case "status": return String(t.status)
        case "urgency": return String(t.urgency || 1)
        case "supplier": return t.supplierId || "__none__"
        case "booker": return t.bookerId || "__none__"
        default: return "__all__"
      }
    }
    for (const t of tasks) {
      const key = getKey(t)
      if (!g.has(key)) g.set(key, [])
      g.get(key)!.push(t)
    }
    let keys: string[]
    if (groupBy === "plannedDate") {
      keys = [...g.keys()].sort((a, b) => {
        if (a === "__none__") return 1
        if (b === "__none__") return -1
        return a.localeCompare(b)
      })
    } else if (groupBy === "status") {
      keys = [...g.keys()].sort((a, b) => Number(a) - Number(b))
    } else if (groupBy === "urgency") {
      keys = [...g.keys()].sort((a, b) => Number(b) - Number(a))
    } else if (groupBy === "supplier" || groupBy === "booker") {
      keys = [...g.keys()].sort((a, b) => {
        if (a === "__none__") return 1
        if (b === "__none__") return -1
        return a.localeCompare(b)
      })
    } else {
      keys = ["__all__"]
    }
    return { groups: g, sortedKeys: keys }
  }, [tasks, groupBy])

  if (!tasks.length) return <div className="task-empty">无任务</div>

  function groupHeader(k: string): string {
    switch (groupBy) {
      case "plannedDate": return k === "__none__" ? "未计划" : dateLabel(k)
      case "status": return k
      case "urgency": return k
      case "supplier": return k === "__none__" ? "无商家" : k
      case "booker": return k === "__none__" ? "无预定人" : k
      default: return ""
    }
  }

  return (
    <div className="task-section">
      {sortedKeys.map(k => (
        <Fragment key={k}>
          {(groupBy !== "status" && groupBy !== "urgency") && k !== "__all__" && (
            <div className="task-group-hdr">{groupHeader(k)}</div>
          )}
          <ul className="task-list">
            {groups.get(k)!.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                onRequestEdit={onRequestEdit}
                selected={selectedIds.has(t.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
  )
}
