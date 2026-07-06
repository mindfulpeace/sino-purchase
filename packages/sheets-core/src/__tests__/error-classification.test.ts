import { describe, it, expect } from "vitest"
import { isRetryableStatus } from "../db"

// 审计 P0-4：验证同步队列的错误分流判定
describe("isRetryableStatus", () => {
  it("网络中断 / 超时（status 0）可重试", () => {
    expect(isRetryableStatus(0)).toBe(true)
  })

  it("限流 429 可重试", () => {
    expect(isRetryableStatus(429)).toBe(true)
  })

  it("服务端 5xx 可重试", () => {
    expect(isRetryableStatus(500)).toBe(true)
    expect(isRetryableStatus(503)).toBe(true)
  })

  it("401 令牌失效且无 refresh，视为永久失败（避免无限重排）", () => {
    expect(isRetryableStatus(401)).toBe(false)
  })

  it("其余 4xx 业务错误为永久失败，应丢弃出队", () => {
    expect(isRetryableStatus(400)).toBe(false)
    expect(isRetryableStatus(403)).toBe(false)
    expect(isRetryableStatus(404)).toBe(false)
    expect(isRetryableStatus(412)).toBe(false)
  })
})
