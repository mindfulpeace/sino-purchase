// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react"
import PlanManagement from "../../../pages/PlanManagement"
import { usePlanStore } from "../../../app/stores/planStore"

/**
 * 本次改动：
 * 1. 选中任务后的操作按钮（复制信息 / 取消选择）+ 批量编辑表单
 *    通过 Portal 移到右侧「批量操作」面板（DOM slot: #plan-batch-actions-slot）。
 * 2. 多选后批量编辑表单自动出现，无需点击「编辑」。
 * 3. 「编辑」按钮已移除；按钮改名为「复制信息」「取消选择」。
 */
describe("批量操作面板：选中任务后操作按钮 + 自动展开详情", () => {
  let slot: HTMLDivElement

  beforeEach(() => {
    // 模拟 App.tsx 右侧「批量操作」面板提供的挂载点
    slot = document.createElement("div")
    slot.id = "plan-batch-actions-slot"
    document.body.appendChild(slot)
  })

  afterEach(() => {
    cleanup()
    slot.remove()
    usePlanStore.setState({ editingTaskId: null, isAdding: false, batchEdit: false, selectedIds: [] })
  })

  it("未选中时右侧 slot 内无操作按钮", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))
    expect(within(slot).queryByText("复制信息")).toBeNull()
    expect(within(slot).queryByText("取消选择")).toBeNull()
  })

  it("选中任务后，复制信息/取消选择按钮出现且批量编辑表单自动出现（无需点编辑）", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const checkbox = document.querySelector<HTMLInputElement>('input[type="checkbox"]')
    expect(checkbox, "应存在任务勾选框").toBeTruthy()
    fireEvent.click(checkbox!)

    await waitFor(() => {
      expect(within(slot).getByText("复制信息")).toBeTruthy()
      expect(within(slot).getByText("取消选择")).toBeTruthy()
      // 旧「编辑」按钮已移除
      expect(within(slot).queryByText("编辑")).toBeNull()
      // 批量编辑表单（TaskDetail mode=batch）应随选中自动出现在 slot 内
      expect(
        slot.querySelectorAll("input, textarea, [role='combobox']").length,
        "批量编辑表单应随选中自动出现",
      ).toBeGreaterThan(0)
    })
  })

  it("点「取消选择」后，slot 内按钮与批量编辑表单均消失", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const checkbox = document.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    fireEvent.click(checkbox!)
    await waitFor(() => expect(within(slot).queryByText("复制信息")).toBeTruthy())

    fireEvent.click(within(slot).getByText("取消选择"))

    await waitFor(() => {
      expect(within(slot).queryByText("复制信息")).toBeNull()
      expect(within(slot).queryByText("取消选择")).toBeNull()
      expect(slot.querySelectorAll("input, textarea, [role='combobox']").length).toBe(0)
    })
  })
})

/**
 * 回归保护：批量编辑界面只应出现在右侧「批量操作」面板的 slot 中。
 * 当 slot 不存在（例如停在「计划设置」tab，或右侧面板尚未就绪）时，
 * 必须隐藏——绝不能回退渲染到中间区（PlanManagement 本身）。
 */
describe("批量编辑绝不渲染到中间区（仅右侧面板 slot）", () => {
  beforeEach(() => {
    // 关键：本组不挂载 #plan-batch-actions-slot，模拟停在「计划设置」tab
  })

  afterEach(() => {
    cleanup()
    usePlanStore.setState({ editingTaskId: null, isAdding: false, batchEdit: false, selectedIds: [] })
  })

  it("slot 不存在时，选中任务后批量编辑 UI 不出现在任何位置", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const checkbox = document.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    fireEvent.click(checkbox!)
    // 等待自动展开逻辑跑完（useEffect → setShowBatchEdit(true)）
    await new Promise(r => setTimeout(r, 50))

    // 批量操作条与批量编辑表单由 batchActions 独家渲染，其独有标记为「复制信息」「取消选择」。
    // 整份文档都不应出现——证明无 slot 时隐藏，不会回退到中间区。
    expect(screen.queryByText("复制信息"), "操作条按钮不应出现").toBeNull()
    expect(screen.queryByText("取消选择"), "操作条按钮不应出现").toBeNull()
  })
})
