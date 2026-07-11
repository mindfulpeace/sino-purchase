/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { PlanSettingsPanel } from "../components/PlanSettingsPanel"
import { usePlanStore } from "../../../app/stores/planStore"

describe("PlanSettingsPanel (MUI 重写)", () => {
  beforeEach(() => {
    localStorage.clear()
    usePlanStore.getState().setDateEndToday(false)
  })
  afterEach(cleanup)

  it("挂载并渲染汇率与日期两个区块", () => {
    render(<PlanSettingsPanel />)
    expect(screen.getByText("默认汇率")).toBeTruthy()
    expect(screen.getByText("起止日期")).toBeTruthy()
    // MUI 输入框标签
    expect(screen.getByLabelText("$ 1 = k")).toBeTruthy()
    expect(screen.getByLabelText("¥ 1 = k")).toBeTruthy()
    expect(screen.getByLabelText("开始")).toBeTruthy()
    expect(screen.getByLabelText("结束")).toBeTruthy()
    // 操作按钮
    expect(screen.getByText("保存")).toBeTruthy()
    expect(screen.getByText("刷新")).toBeTruthy()
    expect(screen.getByText("重置")).toBeTruthy()
  })

  it("「至今」开关联动 store.dateEndToday", () => {
    render(<PlanSettingsPanel />)
    const toggle = screen.getByRole("switch")
    expect(usePlanStore.getState().dateEndToday).toBe(false)
    fireEvent.click(toggle)
    expect(usePlanStore.getState().dateEndToday).toBe(true)
    // 结束日期输入框应被禁用
    expect((screen.getByLabelText("结束") as HTMLInputElement).disabled).toBe(true)
  })

  it("月份快捷按钮设置起止日期", () => {
    render(<PlanSettingsPanel />)
    const thisMonth = String(new Date().getMonth() + 1)
    const btn = screen.getByRole("button", { name: `${thisMonth}月` })
    fireEvent.click(btn)
    const { dateStart, dateEnd } = usePlanStore.getState()
    expect(dateStart).toMatch(/^\d{4}-\d{2}-01$/)
    expect(dateEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
