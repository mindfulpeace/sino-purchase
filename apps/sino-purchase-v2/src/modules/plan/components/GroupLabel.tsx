import type { GroupBy } from "../types"
import { STATUS_LABEL_CN } from "../types"
import { Text } from "../../../components/ui"

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
  return <Text><span>{label}</span><span style={{ color: "var(--dv-activegroup-visiblepanel-tab-color, var(--text-dim))" }}> {count}</span></Text>
}
