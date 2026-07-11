import { create } from "zustand"
import type { PurchaseTask, TaskStatus, SortBy, GroupBy } from "../../modules/plan/types"

export interface FilterState {
  statusFilter: TaskStatus[]
  urgencyFilter: number[]
  supplierFilter: string
  bookerFilter: string
  sortBy: SortBy
  groupBy: GroupBy
  searchQuery: string
  dateStart: string
  dateEnd: string
  dateEndToday: boolean
}

function loadFilter(): FilterState {
  const def: FilterState = {
    statusFilter: [1, 2, 3],
    urgencyFilter: [2, 3, 4, 5],
    supplierFilter: "",
    bookerFilter: "",
    sortBy: "createdAt",
    groupBy: "none",
    searchQuery: "",
    dateStart: "",
    dateEnd: "",
    dateEndToday: false,
  }
  try {
    const s = localStorage.getItem("sino-plan-filter")
    if (s) {
      const parsed = JSON.parse(s) as Record<string, unknown>
      const merged = { ...def, ...parsed } as FilterState
      // 版本迁移：旧存档（无 v 字段）视为「从未主动改过视图」，其 legacy 默认
      // sortBy=plannedDate、groupBy=plannedDate 升为新的默认（createdAt 排序 + 不分组），
      // 以保证「默认顺序 = 导入/创建顺序」。用户之后显式选择的排序/分组会带 v 字段，不被覆盖。
      if (!("v" in parsed)) {
        if (merged.sortBy === "plannedDate") merged.sortBy = "createdAt"
        if (merged.groupBy === "plannedDate") merged.groupBy = "none"
      }
      return merged
    }
  } catch { /* empty */ }
  return def
}

function saveFilter(f: FilterState) {
  try {
    // 带版本号，区分「显式选择」与「legacy 默认」，便于迁移逻辑不误伤主动选择
    localStorage.setItem("sino-plan-filter", JSON.stringify({ v: 1, ...f }))
  } catch { /* empty */ }
}

/** 纯函数：按筛选态过滤 + 排序。P0-1 起由组件层调用，数据来源为 useSheetData。 */
export function filterAndSortTasks(tasks: PurchaseTask[], filter: FilterState): PurchaseTask[] {
  const { statusFilter, urgencyFilter, supplierFilter, bookerFilter, dateStart, dateEnd, dateEndToday, searchQuery, sortBy } = filter
  let result = tasks

  if (statusFilter.length > 0) result = result.filter(t => statusFilter.includes(t.status))
  if (urgencyFilter.length > 0) result = result.filter(t => urgencyFilter.includes(t.urgency))

  const now = new Date()
  if (dateEndToday) {
    const end = now.toISOString().slice(0, 10)
    result = result.filter(t => {
      if (dateStart && t.plannedDate && t.plannedDate < dateStart) return false
      if (t.plannedDate && t.plannedDate > end) return false
      return true
    })
  } else {
    if (dateStart) result = result.filter(t => t.plannedDate >= dateStart)
    if (dateEnd) result = result.filter(t => t.plannedDate <= dateEnd)
  }

  if (supplierFilter) result = result.filter(t => t.supplierId === supplierFilter)
  if (bookerFilter) result = result.filter(t => t.bookerId === bookerFilter)

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.brand.toLowerCase().includes(q) ||
      t.spec.toLowerCase().includes(q) ||
      t.supplierId.toLowerCase().includes(q) ||
      t.bookerId.toLowerCase().includes(q),
    )
  }

  // 统一兜底排序键：createdAt 升序（即粘贴/创建顺序，先入的在前）。
  // 批量导入时 batchAdd 已让 createdAt 随粘贴下标单调递增，故任意主排序键相等时，
  // 导入的多行严格保持粘贴相对顺序。
  const tiebreak = (a: PurchaseTask, b: PurchaseTask) => a.createdAt - b.createdAt
  result = [...result].sort((a, b) => {
    let primary = 0
    switch (sortBy) {
      case "createdAt": primary = a.createdAt - b.createdAt; break
      case "plannedDate": primary = (a.plannedDate || "Z").localeCompare(b.plannedDate || "Z"); break
      case "status": primary = a.status - b.status; break
      case "urgency": primary = b.urgency - a.urgency; break
      case "supplierId": primary = (a.supplierId || "").localeCompare(b.supplierId || ""); break
      case "bookerId": primary = (a.bookerId || "").localeCompare(b.bookerId || ""); break
      case "receivedDate": primary = (a.receivedDate || "Z").localeCompare(b.receivedDate || "Z"); break
      case "reimbursementDate": primary = (a.reimbursementDate || "Z").localeCompare(b.reimbursementDate || "Z"); break
      case "unitPrice": primary = b.unitPrice - a.unitPrice; break
      case "currency": primary = a.currency.localeCompare(b.currency); break
      case "taxStatus": primary = a.taxStatus.localeCompare(b.taxStatus); break
      case "name": primary = a.name.localeCompare(b.name); break
      case "brand": primary = a.brand.localeCompare(b.brand); break
      case "spec": primary = a.spec.localeCompare(b.spec); break
      case "quantity": primary = b.quantity - a.quantity; break
      case "unit": primary = a.unit.localeCompare(b.unit); break
      case "updatedAt": primary = b.updatedAt - a.updatedAt; break
      default: primary = b.createdAt - a.createdAt
    }
    return primary !== 0 ? primary : tiebreak(a, b)
  })

  return result
}

interface PlanState {
  // Filter state (flat for easy access)
  searchQuery: string
  statusFilter: TaskStatus[]
  urgencyFilter: number[]
  supplierFilter: string
  bookerFilter: string
  sortBy: SortBy
  groupBy: GroupBy
  dateStart: string
  dateEnd: string
  dateEndToday: boolean

  setStatusFilter: (v: TaskStatus[]) => void
  setUrgencyFilter: (v: number[]) => void
  setSupplierFilter: (v: string) => void
  setBookerFilter: (v: string) => void
  setSortBy: (v: SortBy) => void
  setGroupBy: (v: GroupBy) => void
  setSearchQuery: (v: string) => void
  setDateStart: (v: string) => void
  setDateEnd: (v: string) => void
  setDateEndToday: (v: boolean) => void

  // UI state
  editingTaskId: string | null
  setEditingTaskId: (id: string | null) => void
  detailReadOnly: boolean
  setDetailReadOnly: (v: boolean) => void
  isAdding: boolean
  setIsAdding: (v: boolean) => void
  batchEdit: boolean
  setBatchEdit: (v: boolean) => void
  showSettings: boolean
  setShowSettings: (v: boolean) => void
  showFilter: "status" | "urgency" | "supplier" | "booker" | null
  setShowFilter: (v: "status" | "urgency" | "supplier" | "booker" | null) => void

  // Selection (string[] per P2-2 — serialization-friendly, useShallow-friendly)
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void
  pendingBatchChanges: Partial<PurchaseTask>
  setPendingBatchChanges: (v: Partial<PurchaseTask>) => void
}

export const usePlanStore = create<PlanState>((set, get) => {
  const saved = loadFilter()

  // P2-3：用映射类型 setter 替代 `as any`，保留 TS 严格性
  function setter<K extends keyof FilterState>(key: K) {
    return (value: FilterState[K]) => {
      set({ [key]: value } as Partial<PlanState>)
      const s = get()
      saveFilter({
        statusFilter: s.statusFilter, urgencyFilter: s.urgencyFilter, supplierFilter: s.supplierFilter,
        bookerFilter: s.bookerFilter, sortBy: s.sortBy, groupBy: s.groupBy, searchQuery: s.searchQuery,
        dateStart: s.dateStart, dateEnd: s.dateEnd, dateEndToday: s.dateEndToday,
      })
    }
  }

  return {
    // Filter (flat)
    searchQuery: saved.searchQuery,
    statusFilter: saved.statusFilter,
    urgencyFilter: saved.urgencyFilter,
    supplierFilter: saved.supplierFilter,
    bookerFilter: saved.bookerFilter,
    sortBy: saved.sortBy,
    groupBy: saved.groupBy,
    dateStart: saved.dateStart,
    dateEnd: saved.dateEnd,
    dateEndToday: saved.dateEndToday,

    setStatusFilter: setter("statusFilter"),
    setUrgencyFilter: setter("urgencyFilter"),
    setSupplierFilter: setter("supplierFilter"),
    setBookerFilter: setter("bookerFilter"),
    setSortBy: setter("sortBy"),
    setGroupBy: setter("groupBy"),
    setSearchQuery: setter("searchQuery"),
    setDateStart: setter("dateStart"),
    setDateEnd: setter("dateEnd"),
    setDateEndToday: setter("dateEndToday"),

    // UI state
    editingTaskId: null,
    setEditingTaskId: (editingTaskId) => set({ editingTaskId, detailReadOnly: true }),
    detailReadOnly: true,
    setDetailReadOnly: (detailReadOnly) => set({ detailReadOnly }),
    isAdding: false,
    setIsAdding: (isAdding) => set({ isAdding }),
    batchEdit: false,
    setBatchEdit: (batchEdit) => set({ batchEdit }),
    showSettings: false,
    setShowSettings: (showSettings) => set({ showSettings }),
    showFilter: null,
    setShowFilter: (showFilter) => set({ showFilter }),

    // Selection
    selectedIds: [],
    onToggleSelect: (id) => set(s => {
      const next = s.selectedIds.includes(id)
        ? s.selectedIds.filter(x => x !== id)
        : [...s.selectedIds, id]
      return { batchEdit: false, selectedIds: next }
    }),
    clearSelection: () => set({ selectedIds: [] }),
    selectAll: (ids) => set({ batchEdit: false, selectedIds: ids }),
    pendingBatchChanges: {},
    setPendingBatchChanges: (pendingBatchChanges) => set({ pendingBatchChanges }),
  }
})
