// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import PlanManagement from "../../../pages/PlanManagement"
import { usePlanStore } from "../../../app/stores/planStore"

beforeAll(() => {
  // jsdom 无 clipboard，BatchImportDialog 打开时会读剪贴板
  Object.assign(navigator, { clipboard: { readText: () => Promise.reject(new Error("no clipboard")) } })
})

describe("批量导入：导入后界面应出现新任务", () => {
  afterEach(() => {
    cleanup()
    usePlanStore.setState({ editingTaskId: null, isAdding: false, batchEdit: false })
  })

  it("粘贴无『状态/紧急』列的数据导入后，界面应渲染出新任务", async () => {
    render(<PlanManagement />)
    await waitFor(() => expect(screen.getAllByText("安全帽").length).toBeGreaterThan(0))

    // 打开批量导入
    fireEvent.click(screen.getByText("批量"))
    const textarea = await screen.findByPlaceholderText(/名称/) as HTMLTextAreaElement

    // 只有 名称/数量/单位 三列，没有 状态/紧急
    const pasted = "名称\t数量\t单位\n螺栓M8\t50\t个\n垫片\t30\t个"
    fireEvent.change(textarea, { target: { value: pasted } })

    // 解析成功应出现『导入 (2)』按钮
    const importBtn = await screen.findByText(/导入 \(2\)/)
    fireEvent.click(importBtn)

    // 断言：导入后界面应能看到『螺栓M8』
    await waitFor(() => {
      expect(screen.queryAllByText(/螺栓M8/).length, "导入后界面应渲染出『螺栓M8』").toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})
