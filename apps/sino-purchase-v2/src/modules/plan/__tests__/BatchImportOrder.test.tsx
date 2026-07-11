// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { filterAndSortTasks, type FilterState } from "../../../app/stores/planStore"
import PlanManagement from "../../../pages/PlanManagement"
import { usePlanStore } from "../../../app/stores/planStore"
import type { PurchaseTask } from "../types"

beforeAll(() => {
  Object.assign(navigator, { clipboard: { readText: () => Promise.reject(new Error("no clipboard")) } })
})

// 模拟批量导入：三行粘贴顺序 甲/乙/丙，plannedDate 乱序，createdAt 随粘贴下标递增
const imported: PurchaseTask[] = [
  { id: "a", name: "导入甲", quantity: 1, unit: "个", urgency: 2, currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣", plannedDate: "2026-03-01", status: 1, createdAt: 1000, updatedAt: 1000 } as PurchaseTask,
  { id: "b", name: "导入乙", quantity: 1, unit: "个", urgency: 2, currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣", plannedDate: "2026-01-01", status: 1, createdAt: 1001, updatedAt: 1001 } as PurchaseTask,
  { id: "c", name: "导入丙", quantity: 1, unit: "个", urgency: 2, currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣", plannedDate: "2026-02-01", status: 1, createdAt: 1002, updatedAt: 1002 } as PurchaseTask,
]

const baseFilter: FilterState = {
  statusFilter: [1, 2, 3], urgencyFilter: [2, 3, 4, 5], supplierFilter: "", bookerFilter: "",
  dateStart: "", dateEnd: "", dateEndToday: false, searchQuery: "", groupBy: "none", sortBy: "createdAt",
}

describe("批量导入：多行相对顺序应与粘贴一致", () => {
  it("默认按 createdAt（创建/粘贴顺序）排序时，三行顺序=甲<乙<丙", () => {
    const r = filterAndSortTasks(imported, { ...baseFilter, sortBy: "createdAt" })
    const names = r.map(t => t.name)
    expect(names.indexOf("导入甲")).toBeLessThan(names.indexOf("导入乙"))
    expect(names.indexOf("导入乙")).toBeLessThan(names.indexOf("导入丙"))
  })

  it("即便按预定日期排序，因 createdAt 兜底键，等日期内仍保持粘贴顺序（此处日期各不相同，主序生效但兜底键已编码顺序）", () => {
    // 主排序键为 plannedDate 时，不同日期按日期排；但若某两行日期相同，createdAt 兜底保证粘贴顺序。
    // 这里验证兜底键本身：构造两行同日期，顺序应=createdAt 升序=粘贴顺序。
    const sameDate: PurchaseTask[] = [
      { id: "x", name: "X前", quantity: 1, unit: "个", urgency: 2, currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣", plannedDate: "2026-05-01", status: 1, createdAt: 200, updatedAt: 200 } as PurchaseTask,
      { id: "y", name: "Y后", quantity: 1, unit: "个", urgency: 2, currency: "ZMW", exchangeRate: 1, taxStatus: "可抵扣", plannedDate: "2026-05-01", status: 1, createdAt: 201, updatedAt: 201 } as PurchaseTask,
    ]
    const r = filterAndSortTasks(sameDate, { ...baseFilter, sortBy: "plannedDate" })
    expect(r.map(t => t.name)).toEqual(["X前", "Y后"])
  })
})

describe("端到端：批量导入后 DOM 顺序应与粘贴一致", () => {
  afterEach(() => {
    cleanup()
    usePlanStore.setState({ editingTaskId: null, isAdding: false, batchEdit: false })
  })

  it("粘贴 甲(03-01)/乙(01-01)/丙(02-01) 导入后，span.n 渲染顺序应为 甲<乙<丙", async () => {
    // 模拟 Max 当前真实情况：localStorage 里是旧版（无 v 字段）plannedDate 偏好
    localStorage.setItem("sino-plan-filter", JSON.stringify({
      statusFilter: [1, 2, 3], urgencyFilter: [2, 3, 4, 5], supplierFilter: "", bookerFilter: "",
      sortBy: "plannedDate", groupBy: "plannedDate", searchQuery: "", dateStart: "", dateEnd: "", dateEndToday: false,
    }))
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    fireEvent.click(screen.getByText("批量"))
    const textarea = await screen.findByPlaceholderText(/名称/) as HTMLTextAreaElement
    const pasted = "名称\t数量\t单位\t日期\n导入甲\t1\t个\t2026-03-01\n导入乙\t1\t个\t2026-01-01\n导入丙\t1\t个\t2026-02-01"
    fireEvent.change(textarea, { target: { value: pasted } })

    const importBtn = await screen.findByText(/导入 \(3\)/)
    fireEvent.click(importBtn)

    await waitFor(() => {
      const names = Array.from(document.querySelectorAll("span.n")).map(e => e.textContent || "")
      expect(names.some(n => n.includes("导入甲"))).toBe(true)
    }, { timeout: 3000 })

    const names = Array.from(document.querySelectorAll("span.n")).map(e => e.textContent || "")
    const ia = names.findIndex(n => n.includes("导入甲"))
    const ib = names.findIndex(n => n.includes("导入乙"))
    const ic = names.findIndex(n => n.includes("导入丙"))
    expect(ia).toBeLessThan(ib)
    expect(ib).toBeLessThan(ic)
  })
})
