import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// 审计 P0-4：mock auth（提供令牌）与 fetch，验证 processQueue 按错误类型分流。
vi.mock("../auth", () => ({
  requestToken: vi.fn(async () => "fake-token"),
  clearToken: vi.fn(),
}))

import { processQueue } from "../db"
import { enqueue, loadQueue } from "../sync-queue"

function makeLocalStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => store.clear(),
  }
}

function mockFetch(statusFor: (url: string, method?: string) => number) {
  globalThis.fetch = vi.fn(async (url: string, opts?: RequestInit) => {
    const status = statusFor(url, opts?.method)
    return {
      ok: status < 400,
      status,
      json: async () => {
        if (url.includes("!1:1")) return { values: [["col1", "col2"]] }
        if (url.includes("batchUpdate")) return {}
        if (url.includes("append")) return { updates: { updatedRange: "S!A5:Z5" } }
        return { sheets: [] }
      },
    }
  }) as unknown as typeof fetch
}

beforeEach(() => {
  vi.stubGlobal("localStorage", makeLocalStorage())
  vi.stubGlobal("window", { dispatchEvent: vi.fn() })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete (globalThis as { fetch?: unknown }).fetch
})

describe("processQueue 错误分流", () => {
  it("成功项出队，5xx 重试（保留），4xx 永久失败（丢弃）", async () => {
    // insert -> append 接口返回 200 成功
    enqueue({ sheet: "S", op: "insert", data: { a: 1 } })
    // update -> PUT values 接口返回 500，应重试
    enqueue({ sheet: "S", op: "update", rowIndex: 2, data: {}, headers: [] })
    // delete -> batchUpdate 接口返回 404，应丢弃
    enqueue({ sheet: "S", op: "delete", rowIndex: 3 })

    // 元数据/表头 GET 一律成功；仅按写操作类型定状态码：
    // insert(append)=200 成功, update(PUT)=500 重试, delete(batchUpdate)=404 丢弃
    mockFetch((url, method) => {
      if (url.includes("batchUpdate")) return 404
      if (url.includes("append")) return 200
      if (method === "PUT") return 500
      return 200 // 元数据 / 表头请求
    })

    const r = await processQueue()
    expect(r.failed).toBe(1)
    expect(r.retried).toBe(1)

    const remaining = loadQueue()
    expect(remaining.length).toBe(1)
    expect(remaining[0].op).toBe("update")
  })

  it("空队列直接返回，不触发任何请求", async () => {
    const r = await processQueue()
    expect(r).toEqual({ retried: 0, failed: 0 })
  })
})
