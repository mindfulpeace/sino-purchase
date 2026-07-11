import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"

/**
 * 验证 LoginGate 的三条分支（真实渲染断言，非状态臆断）：
 *  - 开发环境（PROD=false）：始终放行，保留 demo 数据入口。
 *  - 生产环境（PROD=true）+ 未登录：拦截，显示「登录 Google」提示，不渲染业务内容。
 *  - 生产环境（PROD=true）+ 已登录：放行，渲染业务内容。
 */
async function renderGate(prod: boolean, loggedIn: boolean) {
  vi.stubEnv("PROD", prod)
  vi.resetModules()
  vi.doMock("@sino-purchase/sheets-react", () => ({
    useAuth: () => ({ loggedIn, login: vi.fn(), user: null, ready: true }),
  }))
  const { LoginGate } = await import("./LoginGate")
  return renderToString(<LoginGate><div>APP_CONTENT</div></LoginGate>)
}

describe("LoginGate 生产环境登录闸门", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it("开发环境 + 未登录：放行，渲染业务内容（保留 demo 数据）", async () => {
    const html = await renderGate(false, false)
    expect(html).toContain("APP_CONTENT")
    expect(html).not.toContain("登录 Google")
  })

  it("生产环境 + 未登录：拦截，显示 Google 登录提示且不渲染业务内容", async () => {
    const html = await renderGate(true, false)
    expect(html).toContain("登录 Google")
    expect(html).not.toContain("APP_CONTENT")
  })

  it("生产环境 + 已登录：放行，渲染业务内容", async () => {
    const html = await renderGate(true, true)
    expect(html).toContain("APP_CONTENT")
    expect(html).not.toContain("登录 Google")
  })
})
