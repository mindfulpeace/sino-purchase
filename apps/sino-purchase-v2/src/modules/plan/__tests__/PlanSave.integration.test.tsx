// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import PlanManagement from "../../../pages/PlanManagement"
import { usePlanStore } from "../../../app/stores/planStore"

// P0-1：数据所有权已归 useSheetData（通过 PlanDataContext 共享），store 不再持有数据副本。
// 因此断言改为校验「界面渲染出的 item-body 是否显示新值」，而非 store.allTasks。
describe("PlanManagement 折叠保存（真实组件集成）", () => {
  afterEach(() => {
    cleanup()
    // 仅重置仍存在的 UI/编辑态字段，避免跨测试泄漏
    usePlanStore.setState({ editingTaskId: null, isAdding: false, batchEdit: false })
  })

  it("编辑后点 task-body 折叠，界面应渲染新值", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const nameSpan = screen.getAllByText("安全帽")[0]
    const bodyBox = nameSpan.closest("div") as HTMLElement
    expect(bodyBox).toBeTruthy()

    // 第一次点击 → 展开 detail
    fireEvent.click(bodyBox)

    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "安全帽X" } })

    // 第二次点击 task-body → 折叠（触发 commit 保存）
    fireEvent.click(bodyBox)

    // 断言：渲染出的 item-body 文本应包含新值
    await waitFor(() => {
      expect(screen.getAllByText("安全帽X").length, "折叠后界面应渲染出「安全帽X」").toBeGreaterThan(0)
    })
    // 旧名「安全帽」（精确匹配，不含 X）应已消失
    expect(screen.queryByText("安全帽"), "旧名「安全帽」精确文本应已不存在").toBeNull()
  })

  it("编辑中点另一个 task 的 task-body 切换，当前项应保存", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const firstBody = screen.getAllByText("安全帽")[0].closest("div") as HTMLElement
    const secondBody = screen.getAllByText("柴油滤芯")[0].closest("div") as HTMLElement

    fireEvent.click(firstBody)
    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "安全帽X" } })

    // 点第二个的 task-body → 切换编辑项，触发第一个折叠保存
    fireEvent.click(secondBody)

    await waitFor(() => {
      expect(screen.getAllByText("安全帽X").length, "切换到其他 accordion 后，前一个任务应已保存并渲染新值").toBeGreaterThan(0)
    })
  })

  it("编辑中点 detail 的「放弃保存」按钮，应不保存", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const firstBody = screen.getAllByText("安全帽")[0].closest("div") as HTMLElement
    fireEvent.click(firstBody)
    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "安全帽Y" } })

    const discardBtn = screen.getByTitle("放弃保存")
    fireEvent.click(discardBtn)

    await new Promise(r => setTimeout(r, 50))
    expect(screen.queryByText("安全帽Y"), "放弃保存后不应出现「安全帽Y」").toBeNull()
    expect(screen.getAllByText("安全帽").length, "原任务「安全帽」应仍在").toBeGreaterThan(0)
  })
})
