/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from "react"
import { useSheetData } from "@sino-purchase/sheets-api"
import type { PurchaseTask, TaskStatus, SortBy, GroupBy } from "./types"
import { TASK_HEADERS, NUMERIC_FIELDS, DATE_FIELDS } from "./types"

const SHEET = "tasks"

const FILTER_KEY = "sino-plan-filter"

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
    const s = localStorage.getItem(FILTER_KEY)
    if (s) return { ...def, ...JSON.parse(s) }
  } catch { /* empty */ }
  return def
}

interface PlanContextValue {
  tasks: PurchaseTask[]
  allTasks: PurchaseTask[]
  loading: boolean
  reload: () => void
  addTask: (data: Partial<PurchaseTask>) => void
  updateTask: (id: string, changes: Partial<PurchaseTask>) => void
  deleteTask: (id: string) => void

  filteredTasks: PurchaseTask[]
  sortBy: SortBy
  setSortBy: (v: SortBy) => void
  statusFilter: TaskStatus[]
  setStatusFilter: (v: TaskStatus[]) => void
  urgencyFilter: number[]
  setUrgencyFilter: (v: number[]) => void
  supplierFilter: string
  setSupplierFilter: (v: string) => void
  bookerFilter: string
  setBookerFilter: (v: string) => void
  groupBy: GroupBy
  setGroupBy: (v: GroupBy) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  dateStart: string
  setDateStart: (v: string) => void
  dateEnd: string
  setDateEnd: (v: string) => void
  dateEndToday: boolean
  setDateEndToday: (v: boolean) => void

  editingTaskId: string | null
  setEditingTaskId: (id: string | null) => void
  isAdding: boolean
  setIsAdding: (v: boolean) => void
  batchEdit: boolean
  setBatchEdit: (v: boolean) => void

  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void

  urgentAll: number
  urgentHigh: number
  urgentMid: number
  urgentLow: number
  completed: number

  showFilter: "status" | "urgency" | "supplier" | "booker" | null
  setShowFilter: (v: "status" | "urgency" | "supplier" | "booker" | null) => void

  pendingBatchChanges: Partial<PurchaseTask>
  setPendingBatchChanges: (v: Partial<PurchaseTask>) => void
  confirmBatchApply: () => void
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used within PlanProvider")
  return ctx
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const init = loadFilter()

  const { data, loading, reload, add, update, remove } = useSheetData<PurchaseTask>({
    sheetName: SHEET,
    headers: TASK_HEADERS,
    numericFields: NUMERIC_FIELDS,
    dateFields: DATE_FIELDS,
  })

  const [searchQuery, setSearchQuery] = useState(init.searchQuery)
  const [sortBy, setSortBy] = useState<SortBy>(init.sortBy)
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(init.statusFilter)
  const [urgencyFilter, setUrgencyFilter] = useState<number[]>(init.urgencyFilter)
  const [supplierFilter, setSupplierFilter] = useState(init.supplierFilter)
  const [bookerFilter, setBookerFilter] = useState(init.bookerFilter)
  const [groupBy, setGroupBy] = useState<GroupBy>(init.groupBy)
  const [dateStart, setDateStart] = useState(init.dateStart)
  const [dateEnd, setDateEnd] = useState(init.dateEnd)
  const [dateEndToday, setDateEndToday] = useState(init.dateEndToday)
  const [showFilter, setShowFilter] = useState<"status" | "urgency" | "supplier" | "booker" | null>(null)

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [batchEdit, setBatchEdit] = useState(false)
  const [pendingBatchChanges, setPendingBatchChanges] = useState<Partial<PurchaseTask>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const tasks = data

  useEffect(() => {
    const t = setTimeout(
      () => localStorage.setItem(FILTER_KEY, JSON.stringify({ statusFilter, urgencyFilter, supplierFilter, bookerFilter, sortBy, groupBy, searchQuery, dateStart, dateEnd, dateEndToday })),
      300,
    )
    return () => clearTimeout(t)
  }, [statusFilter, urgencyFilter, supplierFilter, bookerFilter, sortBy, groupBy, searchQuery, dateStart, dateEnd, dateEndToday])

  const filteredTasks = useMemo(() => {
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
  }, [tasks, statusFilter, urgencyFilter, supplierFilter, bookerFilter, dateStart, dateEnd, dateEndToday, searchQuery, sortBy])

  const onToggleSelect = useCallback((id: string) => {
    setBatchEdit(false)
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])
  const selectAll = useCallback((ids: string[]) => {
    setBatchEdit(false)
    setSelectedIds(new Set(ids))
  }, [])

  const confirmBatchApply = useCallback(() => {
    const ids = [...selectedIds]
    for (const id of ids) update(id, pendingBatchChanges)
    setPendingBatchChanges({})
    setBatchEdit(false)
    setSelectedIds(new Set())
  }, [selectedIds, pendingBatchChanges, update])

  const addTask = useCallback((data: Partial<PurchaseTask>) => {
    add(data)
    setIsAdding(false)
    setEditingTaskId(null)
  }, [add])

  const updateTask = useCallback((id: string, changes: Partial<PurchaseTask>) => {
    update(id, changes)
    setEditingTaskId(null)
  }, [update])

  const deleteTask = useCallback((id: string) => {
    remove(id)
    setEditingTaskId(null)
  }, [remove])

  const stats = useMemo(() => {
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
  }, [tasks])

  return (
    <PlanContext.Provider
      value={{
        tasks: filteredTasks,
        allTasks: tasks,
        loading,
        reload,
        addTask,
        updateTask,
        deleteTask,

        filteredTasks,
        sortBy, setSortBy,
        statusFilter, setStatusFilter,
        urgencyFilter, setUrgencyFilter,
        supplierFilter, setSupplierFilter,
        bookerFilter, setBookerFilter,
        groupBy, setGroupBy,
        searchQuery, setSearchQuery,
        dateStart, setDateStart,
        dateEnd, setDateEnd,
        dateEndToday, setDateEndToday,

        editingTaskId, setEditingTaskId,
        isAdding, setIsAdding,
        batchEdit, setBatchEdit,

        selectedIds, onToggleSelect, clearSelection, selectAll,

        ...stats,

        showFilter, setShowFilter,

        pendingBatchChanges, setPendingBatchChanges,
        confirmBatchApply,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}
