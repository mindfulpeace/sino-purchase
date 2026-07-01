import type { GroupBy } from "../types"
import { STATUS_LABEL_CN } from "../types"
import { Text } from "@blueprintjs/core"

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
  return <Text><span>{label}</span><span style={{ color: "var(--dv-activegroup-visiblepanel-tab-color, rgba(255,255,255,0.4))" }}> {count}</span></Text>
}
