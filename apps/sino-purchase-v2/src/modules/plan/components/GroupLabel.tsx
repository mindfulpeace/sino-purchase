import type { GroupBy } from "../types"
import { STATUS_LABEL_CN } from "../types"

interface Props {
  groupBy: GroupBy
  value: string
  count: number
}

export function GroupLabel({ groupBy, value, count }: Props) {
  const label = (() => {
    if (groupBy === "plannedDate") return value
    if (groupBy === "status") return STATUS_LABEL_CN[Number(value)] ?? value
    return value
  })()
  return (<div className="group-label"><span>{label}</span><span className="dim-text"> {count}</span></div>)
}
