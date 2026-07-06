// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { useState } from "react"
import { TaskItem } from "../components/TaskItem"
import type { PurchaseTask } from "../types"

// jsdom 缺省没有 MUI 依赖的浏览器 API，补一下
beforeAll(() => {
  class RO { observe() {} unobserve() {} disconnect() {} }
  ;(globalThis as any).ResizeObserver = RO
  if (!window.matchMedia) {
    window.matchMedia = (() => ({
      matches: false, media: "", onchange: null,
      addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false },
    })) as any
  }
})

afterEach(() => cleanup())

const mk = (id: string, name: string): PurchaseTask => ({
  id,
  name,
  brand: "",
  spec: "",
  quantity: 1,
  unit: "个",
  unitPrice: 0,
  taxStatus: "无税",
  currency: "ZMW",
  exchangeRate: 1,
  supplierId: "",
  bookerId: "",
  status: 1,
  urgency: 3,
  createdAt: 0,
  plannedDate: "",
  receivedDate: "",
  reimbursementDate: "",
  updatedAt: 0,
})

function Multi({ tasks, onSave }: { tasks: PurchaseTask[]; onSave: ReturnType<typeof vi.fn> }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <div>
      {tasks.map(t => (
        <TaskItem
          key={t.id}
          task={t}
          isEditing={editingId === t.id}
          selected={false}
          onRequestEdit={(id) => setEditingId(id)}
          onToggleSelect={() => {}}
          onSave={onSave}
          onCancel={() => setEditingId(null)}
          onDelete={() => {}}
        />
      ))}
    </div>
  )
}

describe("TaskItem 展开/闭合与保存行为", () => {
  it("点击 task-body 展开后编辑，再点 task-body 闭合 -> 保存", () => {
    const onSave = vi.fn()
    const t = mk("t1", "安全帽")
    render(<Multi tasks={[t]} onSave={onSave} />)

    // 展开
    fireEvent.click(screen.getByText("安全帽"))
    const input = screen.getByDisplayValue("安全帽") as HTMLInputElement
    // 编辑
    fireEvent.change(input, { target: { value: "安全帽X" } })
    expect(onSave).not.toHaveBeenCalled()
    // 再点 task-body 闭合（task-body 仍显示 prop 的 "安全帽"）
    fireEvent.click(screen.getByText("安全帽"))
    // 期望自动保存草稿
    expect(onSave).toHaveBeenCalledTimes(1)
    const saved = onSave.mock.calls[0][0] as Partial<PurchaseTask>
    expect(saved.name).toBe("安全帽X")
    expect(saved.id).toBe("t1")
  })

  it("编辑中点击另一个 accordion 的 task-body -> 当前项保存", () => {
    const onSave = vi.fn()
    const t1 = mk("t1", "安全帽")
    const t2 = mk("t2", "柴油")
    render(<Multi tasks={[t1, t2]} onSave={onSave} />)

    // 展开 t1
    fireEvent.click(screen.getByText("安全帽"))
    const input = screen.getByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(input, { target: { value: "安全帽Y" } })
    // 点击 t2 的 task-body 切换
    fireEvent.click(screen.getByText("柴油"))
    // t1 应被自动保存
    expect(onSave).toHaveBeenCalledTimes(1)
    const saved = onSave.mock.calls[0][0] as Partial<PurchaseTask>
    expect(saved.name).toBe("安全帽Y")
    expect(saved.id).toBe("t1")
  })

  it("编辑中点击 detail 的 放弃保存 按钮 -> 不保存", () => {
    const onSave = vi.fn()
    const t = mk("t1", "安全帽")
    render(<Multi tasks={[t]} onSave={onSave} />)

    fireEvent.click(screen.getByText("安全帽"))
    const input = screen.getByDisplayValue("安全帽") as HTMLInputElement
    fireEvent.change(input, { target: { value: "安全帽Z" } })
    // 点 放弃保存
    fireEvent.click(screen.getByTitle("放弃保存"))
    expect(onSave).not.toHaveBeenCalled()
  })

  it("点击 task-body 以外区域（日期区）不应展开/闭合（只有 task-body 控制）", () => {
    const onSave = vi.fn()
    const t = { ...mk("t1", "安全帽"), plannedDate: "2026-07-10" }
    render(<Multi tasks={[t]} onSave={onSave} />)
    // 日期区文本 "07-10"
    const dateCell = screen.getByText("07-10")
    fireEvent.click(dateCell)
    // 不应展开（详情里的品名输入框不应出现）
    expect(screen.queryByDisplayValue("安全帽")).toBeNull()
  })
})
