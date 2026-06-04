import { Button, HTMLSelect, ButtonGroup } from "@blueprintjs/core"
import { usePlan } from "../PlanContext"
import type { GroupBy, SortBy } from "../types"

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "plannedDate", label: "日期" },
  { value: "status", label: "状态" },
  { value: "urgency", label: "紧急" },
  { value: "supplier", label: "商家" },
  { value: "booker", label: "预定" },
  { value: "none", label: "不分组" },
]

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "createdAt", label: "创建日期" },
  { value: "plannedDate", label: "计划日期" },
  { value: "status", label: "状态" },
  { value: "urgency", label: "紧急" },
  { value: "supplierId", label: "商家" },
  { value: "bookerId", label: "预定人" },
  { value: "receivedDate", label: "入库日期" },
  { value: "reimbursementDate", label: "报销日期" },
  { value: "unitPrice", label: "单价" },
  { value: "currency", label: "币种" },
  { value: "taxStatus", label: "税种" },
  { value: "name", label: "名称" },
  { value: "brand", label: "品牌" },
  { value: "spec", label: "规格" },
  { value: "quantity", label: "数量" },
  { value: "unit", label: "单位" },
  { value: "updatedAt", label: "更新时间" },
]

const GROUP_SORT_MAP: Record<string, SortBy> = {
  plannedDate: "plannedDate",
  status: "status",
  urgency: "urgency",
  supplier: "supplierId",
  booker: "bookerId",
}

export function SortBar() {
  const { groupBy, setGroupBy, sortBy, setSortBy } = usePlan()
  const excluded = GROUP_SORT_MAP[groupBy]

  return (
    <div className="sort-bar">
      <ButtonGroup minimal>
        {GROUP_OPTIONS.map(o => (
          <Button
            key={o.value}
            small
            active={groupBy === o.value}
            onClick={() => setGroupBy(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </ButtonGroup>
      <HTMLSelect
        value={sortBy}
        onChange={e => setSortBy(e.target.value as SortBy)}
        style={{ marginLeft: 8 }}
      >
        {SORT_OPTIONS.filter(o => o.value !== excluded).map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </HTMLSelect>
    </div>
  )
}
