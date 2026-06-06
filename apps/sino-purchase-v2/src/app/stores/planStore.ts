import { create } from "zustand"
import type { PurchaseTask, TaskStatus, SortBy, GroupBy } from "../../modules/plan/types"

interface FilterState {
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
    sortBy: "plannedDate",
    groupBy: "plannedDate",
    searchQuery: "",
    dateStart: "",
    dateEnd: "",
    dateEndToday: false,
  }
  try {
    const s = localStorage.getItem("sino-plan-filter")
    if (s) return { ...def, ...JSON.parse(s) }
  } catch { /* empty */ }
  return def
}

function saveFilter(f: FilterState) {
  try {
    localStorage.setItem("sino-plan-filter", JSON.stringify(f))
  } catch { /* empty */ }
}

function filterAndSortTasks(tasks: PurchaseTask[], filter: FilterState): PurchaseTask[] {
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

  result = [...result].sort((a, b) => {
    switch (sortBy) {
      case "plannedDate": return (a.plannedDate || "Z").localeCompare(b.plannedDate || "Z")
      case "status": return a.status - b.status
      case "urgency": return b.urgency - a.urgency
      case "supplierId": return (a.supplierId || "").localeCompare(b.supplierId || "")
      case "bookerId": return (a.bookerId || "").localeCompare(b.bookerId || "")
      case "receivedDate": return (a.receivedDate || "Z").localeCompare(b.receivedDate || "Z")
      case "reimbursementDate": return (a.reimbursementDate || "Z").localeCompare(b.reimbursementDate || "Z")
      case "unitPrice": return b.unitPrice - a.unitPrice
      case "currency": return a.currency.localeCompare(b.currency)
      case "taxStatus": return a.taxStatus.localeCompare(b.taxStatus)
      case "name": return a.name.localeCompare(b.name)
      case "brand": return a.brand.localeCompare(b.brand)
      case "spec": return a.spec.localeCompare(b.spec)
      case "quantity": return b.quantity - a.quantity
      case "unit": return a.unit.localeCompare(b.unit)
      case "updatedAt": return b.updatedAt - a.updatedAt
      default: return b.createdAt - a.createdAt
    }
  })

  return result
}

interface PlanState {
  // Data (来自 sheets-api, 通过 setAllTasks 注入)
  allTasks: PurchaseTask[]
  loading: boolean
  setAllTasks: (tasks: PurchaseTask[]) => void
  setLoading: (loading: boolean) => void

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

  // Computed
  filteredTasks: PurchaseTask[]
  urgentAll: number
  urgentHigh: number
  urgentMid: number
  urgentLow: number
  completed: number

  // UI state
  editingTaskId: string | null
  setEditingTaskId: (id: string | null) => void
  isAdding: boolean
  setIsAdding: (v: boolean) => void
  batchEdit: boolean
  setBatchEdit: (v: boolean) => void
  showFilter: "status" | "urgency" | "supplier" | "booker" | null
  setShowFilter: (v: "status" | "urgency" | "supplier" | "booker" | null) => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void
  pendingBatchChanges: Partial<PurchaseTask>
  setPendingBatchChanges: (v: Partial<PurchaseTask>) => void
  confirmBatchApply: () => void

  // CRUD actions (set by PlanManagement via useSheetData)
  addTask: (data: Partial<PurchaseTask>) => void
  updateTask: (id: string, changes: Partial<PurchaseTask>) => void
  deleteTask: (id: string) => void
  reload: () => void
  setCrudActions: (actions: {
    add: (data: Partial<PurchaseTask>) => void
    update: (id: string, changes: Partial<PurchaseTask>) => void
    remove: (id: string) => void
    reload: () => void
  }) => void
}

export const usePlanStore = create<PlanState>((set, get) => {
  const saved = loadFilter()

  function applyFilter(): Partial<PlanState> {
    const s = get()
    const f: FilterState = {
      statusFilter: s.statusFilter,
      urgencyFilter: s.urgencyFilter,
      supplierFilter: s.supplierFilter,
      bookerFilter: s.bookerFilter,
      sortBy: s.sortBy,
      groupBy: s.groupBy,
      searchQuery: s.searchQuery,
      dateStart: s.dateStart,
      dateEnd: s.dateEnd,
      dateEndToday: s.dateEndToday,
    }
    saveFilter(f)
    const filteredTasks = filterAndSortTasks(s.allTasks, f)
    return { filteredTasks }
  }

  function setter<K extends keyof FilterState>(key: K) {
    return (value: FilterState[K]) => {
      set({ [key]: value } as any)
      set(applyFilter())
    }
  }

  return {
    // Data
    allTasks: [],
    loading: false,
    setAllTasks: (allTasks) => {
      set({ allTasks })
      set(applyFilter())
      set(computeStats(allTasks))
    },
    setLoading: (loading) => set({ loading }),

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

    // Computed
    filteredTasks: [],
    urgentAll: 0, urgentHigh: 0, urgentMid: 0, urgentLow: 0, completed: 0,

    // UI state
    editingTaskId: null,
    setEditingTaskId: (editingTaskId) => set({ editingTaskId }),
    isAdding: false,
    setIsAdding: (isAdding) => set({ isAdding }),
    batchEdit: false,
    setBatchEdit: (batchEdit) => set({ batchEdit }),
    showFilter: null,
    setShowFilter: (showFilter) => set({ showFilter }),
    selectedIds: new Set<string>(),
    onToggleSelect: (id) => {
      set((s) => {
        const next = new Set(s.selectedIds)
        if (next.has(id)) next.delete(id); else next.add(id)
        return { batchEdit: false, selectedIds: next }
      })
    },
    clearSelection: () => set({ selectedIds: new Set<string>() }),
    selectAll: (ids) => { set({ batchEdit: false, selectedIds: new Set(ids) }) },
    pendingBatchChanges: {},
    setPendingBatchChanges: (pendingBatchChanges) => set({ pendingBatchChanges }),

    confirmBatchApply: () => {
      const s = get()
      const { selectedIds, pendingBatchChanges } = s
      if (Object.keys(pendingBatchChanges).length === 0) return
      selectedIds.forEach((id) => {
        s.updateTask(id, pendingBatchChanges)
      })
      set({ selectedIds: new Set<string>(), pendingBatchChanges: {}, batchEdit: false })
    },

    // CRUD actions (will be set by PlanManagement)
    addTask: () => {},
    updateTask: () => {},
    deleteTask: () => {},
    reload: () => {},
    setCrudActions: (actions) => {
      set({
        addTask: (data) => { actions.add(data); set({ isAdding: false, editingTaskId: null }) },
        updateTask: (id, changes) => { actions.update(id, changes); set({ editingTaskId: null }) },
        deleteTask: (id) => { actions.remove(id); set({ editingTaskId: null }) },
        reload: actions.reload,
      })
    },
  }
})

function computeStats(tasks: PurchaseTask[]) {
  let uAll = 0, uHigh = 0, uMid = 0, uLow = 0, done = 0
  for (const t of tasks) {
    if (t.status < 3) {
      uAll++
      if (t.urgency > 3) uHigh++
      else if (t.urgency === 3) uMid++
      else uLow++
    } else {
      done++
    }
  }
  return { urgentAll: uAll, urgentHigh: uHigh, urgentMid: uMid, urgentLow: uLow, completed: done }
}
