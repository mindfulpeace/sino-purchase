// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import PlanManagement from "../../../pages/PlanManagement"
import { usePlanStore } from "../../../app/stores/planStore"

describe("UI 渲染层：折叠后 item-body 应显示新值", () => {
  afterEach(() => {
    cleanup()
    usePlanStore.setState({ editingTaskId: null, isAdding: false, batchEdit: false })
  })

  it("编辑折叠后，界面(渲染的 tasks)应出现『安全帽改了』文本", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const body = screen.getAllByText("安全帽")[0].closest("div") as HTMLElement
    fireEvent.click(body)
    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "安全帽改了" } })
    fireEvent.click(body) // 折叠

    // 断言：渲染出的 item-body 文本应包含新值（不仅是底层 allTasks）
    await waitFor(() => {
      const hit = screen.queryAllByText(/安全帽改了/).length > 0
      expect(hit, "界面上应渲染出『安全帽改了』（filteredTasks 应随数据更新重算）").toBeTruthy()
    }, { timeout: 3000 })
  })
})
