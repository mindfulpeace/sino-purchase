import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { enqueue, queueLen, loadQueue, saveRemaining } from "../sync-queue"

function makeLocalStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => store.clear(),
  }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", makeLocalStorage())
  vi.stubGlobal("window", { dispatchEvent: vi.fn() })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("sync-queue", () => {
  it("enqueue 写入队列并增加长度", () => {
    enqueue({ sheet: "S", op: "insert", data: { a: 1 } })
    expect(queueLen()).toBe(1)
  })

  it("超过 MAX_QUEUE(1000) 时丢弃最旧的，保留最新的", () => {
    for (let i = 0; i < 1005; i++) {
      enqueue({ sheet: "S", op: "insert", data: { i } })
    }
    const q = loadQueue()
    expect(q.length).toBe(1000)
    // 最旧的 i=0 已被丢弃
    expect(q.some(op => (op.data as { i: number }).i === 0)).toBe(false)
    // 最新的 i=1004 仍在
    expect(q.some(op => (op.data as { i: number }).i === 1004)).toBe(true)
  })

  it("saveRemaining 持久化并广播变更事件", () => {
    const w = globalThis.window as unknown as { dispatchEvent: ReturnType<typeof vi.fn> }
    saveRemaining([{ sheet: "S", op: "insert", data: { a: 1 } }])
    expect(queueLen()).toBe(1)
    expect(w.dispatchEvent).toHaveBeenCalled()
  })
})
