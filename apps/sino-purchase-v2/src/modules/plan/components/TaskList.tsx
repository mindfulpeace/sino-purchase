import { useMemo } from "react"
import { NonIdealState, Icon, IconNames, Box } from "../../../components/ui"
import { usePlanStore } from "../../../app/stores/planStore"
import type { PurchaseTask, GroupBy } from "../types"
import { TaskItem } from "./TaskItem"

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

type Row =
  | { kind: "header"; key: string; label: string }
  | { kind: "task"; key: string; task: PurchaseTask }

export function TaskList({ tasks, groupBy, onRequestEdit, editingId, onSave, onCancel, onDelete }: Props) {
  // 只订阅这两个精确字段，避免整个 store 变更导致全列表重渲染
  const selectedIds = usePlanStore(s => s.selectedIds)
  const onToggleSelect = usePlanStore(s => s.onToggleSelect)

  const rows = useMemo<Row[]>(() => {
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

    const out: Row[] = []
    for (const k of keys) {
      const showHeader = groupBy !== "status" && groupBy !== "urgency" && k !== "__all__"
      if (showHeader) {
        const label =
          groupBy === "plannedDate" ? (k === "__none__" ? "未计划" : dateHdr(k)) :
          groupBy === "supplier" ? (k === "__none__" ? "无商家" : k) :
          groupBy === "booker" ? (k === "__none__" ? "无预定人" : k) :
          k
        out.push({ kind: "header", key: `h-${k}`, label })
      }
      for (const task of g.get(k)!) {
        out.push({ kind: "task", key: task.id, task })
      }
    }
    return out
  }, [tasks, groupBy])

  if (tasks.length === 0) return <NonIdealState icon={<Icon icon={IconNames.SEARCH} size={20} />} title="无任务" />

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box data-testid="task-scroller" sx={{ flex: 1, minHeight: 0, overflowY: "auto", fontSize: 12 }}>
        {rows.map(row => row.kind === "header" ? (
          <Box
            key={row.key}
            sx={{
              color: "var(--dv-activegroup-visiblepanel-tab-color, var(--text-dim))",
              fontSize: 11,
              padding: "4px 0 1px",
              borderTop: "1px solid var(--dv-separator-border, var(--border))",
            }}
          >{row.label}</Box>
        ) : (
          <TaskItem
            key={row.key}
            task={row.task}
            onRequestEdit={onRequestEdit}
            isEditing={editingId === row.task.id}
            selected={selectedIds.includes(row.task.id)}
            onToggleSelect={onToggleSelect}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        ))}
      </Box>
    </Box>
  )
}
