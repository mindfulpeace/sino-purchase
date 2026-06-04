import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSidebarResize, useRightResize } from "./useSidebarResize"

describe("useSidebarResize", () => {
  it("starts with default width", () => {
    const { result } = renderHook(() => useSidebarResize())
    expect(result.current.sidebarWidth).toBe(300)
  })

  it("starts with given initialWidth", () => {
    const { result } = renderHook(() => useSidebarResize(200))
    expect(result.current.sidebarWidth).toBe(200)
  })

  it("returns a handler function", () => {
    const { result } = renderHook(() => useSidebarResize())
    expect(typeof result.current.handleSidebarResizeStart).toBe("function")
  })

  it("clamps to minWidth on extreme drag", () => {
    const { result } = renderHook(() => useSidebarResize())
    const e = { preventDefault: () => {}, clientX: 0 } as React.MouseEvent
    act(() => { result.current.handleSidebarResizeStart(e) })
    // mousemove fires at a large negative offset from the handle
    const move = new MouseEvent("mousemove", { clientX: -500 })
    act(() => { document.dispatchEvent(move) })
    const up = new MouseEvent("mouseup")
    act(() => { document.dispatchEvent(up) })
    expect(result.current.sidebarWidth).toBeGreaterThanOrEqual(120)
  })

  it("clamps to maxWidth on extreme drag", () => {
    const { result } = renderHook(() => useSidebarResize())
    const e = { preventDefault: () => {}, clientX: 0 } as React.MouseEvent
    act(() => { result.current.handleSidebarResizeStart(e) })
    const move = new MouseEvent("mousemove", { clientX: 2000 })
    act(() => { document.dispatchEvent(move) })
    const up = new MouseEvent("mouseup")
    act(() => { document.dispatchEvent(up) })
    expect(result.current.sidebarWidth).toBeLessThanOrEqual(600)
  })
})

describe("useRightResize", () => {
  it("starts with default width", () => {
    const { result } = renderHook(() => useRightResize())
    expect(result.current.width).toBe(260)
  })

  it("starts with given initialWidth", () => {
    const { result } = renderHook(() => useRightResize(200))
    expect(result.current.width).toBe(200)
  })

  it("returns a handler function", () => {
    const { result } = renderHook(() => useRightResize())
    expect(typeof result.current.handleResizeStart).toBe("function")
  })
})
