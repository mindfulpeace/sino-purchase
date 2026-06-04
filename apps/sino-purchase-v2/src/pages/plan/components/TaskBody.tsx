import type { PurchaseTask } from "../types"
import { currencySymbol } from "../types"

export function TaskBody({ task }: { task: Partial<PurchaseTask> }) {
  const ccy = task.currency ? currencySymbol(task.currency) : ""
  return (
    <span className="task-body">
      <span className="n">{task.name || ""}</span>
      {task.brand && <span>(<span className="v">{task.brand}</span>)</span>}
      {task.spec && <span>-<span className="v">{task.spec}</span></span>}
      <span> x<span className="v qty">{task.quantity ?? 1}</span>{task.unit || ""}</span>
      {(task.unitPrice ?? 0) > 0 && <span> <span className="v prc">{ccy}{task.unitPrice}</span></span>}
      {task.supplierId && <span> @<span className="v sup">{task.supplierId}</span></span>}
      {task.bookerId && <span> #<span className="v bok">{task.bookerId}</span></span>}
    </span>
  )
}
