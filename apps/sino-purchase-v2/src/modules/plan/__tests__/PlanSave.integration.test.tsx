// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import PlanManagement from "../../../pages/PlanManagement"
import { usePlanStore } from "../../../app/stores/planStore"

describe("PlanManagement 折叠保存（真实组件+真实 store 集成）", () => {
  afterEach(() => {
    cleanup()
    usePlanStore.setState({ allTasks: [], editingTaskId: null, isAdding: false, batchEdit: false })
  })

  it("编辑后点 task-body 折叠，store 中应保存新值", async () => {
    render(<PlanManagement />)
    // 等待 demo 数据加载（TaskList 渲染出第一个任务）
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    // task-body：含"安全帽"文本的 span，其父 Box 绑定 onClick
    const nameSpan = screen.getAllByText("安全帽")[0]
    const bodyBox = nameSpan.closest("div") as HTMLElement
    expect(bodyBox).toBeTruthy()

    // 第一次点击 → 展开 detail
    fireEvent.click(bodyBox)

    // detail 内的 name input（display value 为"安全帽"）
    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "安全帽X" } })

    // 第二次点击 task-body → 折叠（触发 commit 保存）
    fireEvent.click(bodyBox)

    // 断言 store 里该任务 name 已更新
    await waitFor(() => {
      const t = usePlanStore.getState().allTasks.find(x => x.name === "安全帽X")
      expect(t, "折叠后 store 中应存在 name=安全帽X 的任务（保存生效）").toBeTruthy()
    })
  })

  it("编辑中点另一个 task 的 task-body 切换，当前项应保存", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const firstBody = screen.getAllByText("安全帽")[0].closest("div") as HTMLElement
    const secondBody = screen.getAllByText("柴油滤芯")[0].closest("div") as HTMLElement

    // 展开第一个并改名
    fireEvent.click(firstBody)
    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "安全帽X" } })

    // 点第二个的 task-body → 切换编辑项，触发第一个折叠保存
    fireEvent.click(secondBody)

    await waitFor(() => {
      const t = usePlanStore.getState().allTasks.find(x => x.name === "安全帽X")
      expect(t, "切换到其他 accordion 后，前一个任务应已保存").toBeTruthy()
    })
  })

  it("编辑中点 detail 的「放弃保存」按钮，应不保存", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    const firstBody = screen.getAllByText("安全帽")[0].closest("div") as HTMLElement
    fireEvent.click(firstBody)
    const nameInput = await screen.findByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: "安全帽Y" } })

    // 点「放弃保存」图标按钮（title）
    const discardBtn = screen.getByTitle("放弃保存")
    fireEvent.click(discardBtn)

    // 等待可能的异步，再断言：不应保存“安全帽Y”，原“安全帽”仍在
    await new Promise(r => setTimeout(r, 50))
    const all = usePlanStore.getState().allTasks
    expect(all.find(x => x.name === "安全帽Y"), "放弃保存后不应出现 安全帽Y").toBeUndefined()
    expect(all.find(x => x.name === "安全帽"), "原任务 安全帽 应仍在").toBeTruthy()
  })
})
