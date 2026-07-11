// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import PlanManagement from "../../../pages/PlanManagement"
import { usePlanStore } from "../../../app/stores/planStore"

describe("taskItem detail 展开→折叠 应保存编辑内容", () => {
  afterEach(() => {
    cleanup()
    usePlanStore.setState({ editingTaskId: null, isAdding: false, batchEdit: false })
  })

  it("展开某任务 detail → 改数量/品名 → 折叠（isEditing=false）→ store 应保存新值", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    // 展开第一个安全帽的 detail（点 task-body）
    const body = screen.getAllByText("安全帽")[0].closest("div") as HTMLElement
    fireEvent.click(body)
    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement

    // 编辑：改品名
    fireEvent.change(nameInput, { target: { value: "安全帽改了" } })

    // 折叠：再次点 task-body → isEditing 由 true 变 false → detail 卸载 → cleanup 保存
    fireEvent.click(body)

    // 断言：折叠后界面渲染出「安全帽改了」（数据已更新并重算渲染）
    await waitFor(() => {
      expect(screen.queryAllByText(/安全帽改了/).length, "折叠后界面应渲染出「安全帽改了」（保存生效）").toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})
