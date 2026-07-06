import { Fragment, useMemo } from "react"
import { NonIdealState, Icon, IconNames } from "../../../components/ui"
import { usePlanStore } from "../../../app/stores/planStore"
import type { PurchaseTask, GroupBy } from "../types"
import { TaskItem } from "./TaskItem"
import "../plan.css"

interface Props {
  tasks: PurchaseTask[]
  groupBy: GroupBy
  onRequestEdit: (id: string) => void
  editingId: string | null
  onSave: (data: Partial<PurchaseTask>) => void
  onCancel: () => void
  onDelete: (id: string) => void
}

function dateHdr(d: string): string {
  if (!d) return ""
  const [y, mo, da] = d.split("-").map(Number)
  const dt = new Date(y, mo - 1, da)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  const wd = ["日", "一", "二", "三", "四", "五", "六"][dt.getDay()]
  const diff = Math.round((dt.getTime() - today.getTime()) / 86400000)
  return diff === 0 ? `${mm}-${dd} ${wd}` : `${mm}-${dd} ${wd} ${diff > 0 ? "+" : ""}${diff}`
}

export function TaskList({ tasks, groupBy, onRequestEdit, editingId, onSave, onCancel, onDelete }: Props) {
  const { selectedIds, onToggleSelect } = usePlanStore()

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

  if (tasks.length === 0) return <NonIdealState icon={<Icon icon={IconNames.SEARCH} size={20} />} title="无任务" />

  function groupHeader(k: string): string {
    switch (groupBy) {
      case "plannedDate": return k === "__none__" ? "未计划" : dateHdr(k)
      case "status": return `状态 ${k}`
      case "urgency": return `紧急 ${k}`
      case "supplier": return k === "__none__" ? "无商家" : k
      case "booker": return k === "__none__" ? "无预定人" : k
      default: return ""
    }
  }

  return (
    <div>
      {sortedKeys.map(k => (
        <Fragment key={k}>
          {(groupBy !== "status" && groupBy !== "urgency" && k !== "__all__") && (
            <div className="date-hdr">{groupHeader(k)}</div>
          )}
          {groups.get(k)!.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onRequestEdit={onRequestEdit}
              isEditing={editingId === task.id}
              selected={selectedIds.has(task.id)}
              onToggleSelect={onToggleSelect}
              onSave={onSave}
              onCancel={onCancel}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </Fragment>
      ))}
    </div>
  )
}
