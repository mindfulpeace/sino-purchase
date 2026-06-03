import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { useTabs, tabReducer } from "./useTabs"
import type { TabAction, TabState } from "./useTabs"

const tabs = ["a", "b", "c"]

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
}

describe("tabReducer", () => {
  it("opens a new tab", () => {
    const state: TabState = { openIds: [], activeId: null }
    const result = tabReducer(state, { type: "open", id: "a" })
    expect(result.openIds).toEqual(["a"])
    expect(result.activeId).toBe("a")
  })

  it("does not duplicate openIds on reopen", () => {
    const state: TabState = { openIds: ["a", "b"], activeId: "b" }
    const result = tabReducer(state, { type: "open", id: "a" })
    expect(result.openIds).toEqual(["a", "b"])
    expect(result.activeId).toBe("a")
  })

  it("closes a middle tab and activates next", () => {
    const state: TabState = { openIds: ["a", "b", "c"], activeId: "b" }
    const result = tabReducer(state, { type: "close", id: "b" })
    expect(result.openIds).toEqual(["a", "c"])
    expect(result.activeId).toBe("c")
  })

  it("closing last remaining tab sets activeId to null", () => {
    const state: TabState = { openIds: ["a"], activeId: "a" }
    const result = tabReducer(state, { type: "close", id: "a" })
    expect(result.openIds).toEqual([])
    expect(result.activeId).toBeNull()
  })

  it("closing a non-active tab keeps activeId", () => {
    const state: TabState = { openIds: ["a", "b", "c"], activeId: "b" }
    const result = tabReducer(state, { type: "close", id: "a" })
    expect(result.openIds).toEqual(["b", "c"])
    expect(result.activeId).toBe("b")
  })

  it("activate sets activeId", () => {
    const state: TabState = { openIds: ["a", "b"], activeId: "a" }
    const result = tabReducer(state, { type: "activate", id: "b" })
    expect(result.activeId).toBe("b")
  })

  it("activate ignores unknown id", () => {
    const state: TabState = { openIds: ["a"], activeId: "a" }
    const result = tabReducer(state, { type: "activate", id: "x" } as TabAction)
    expect(result).toBe(state)
  })
})

describe("useTabs", () => {
  it("returns empty state when no tabs are stored", () => {
    const { result } = renderHook(() => useTabs(tabs), { wrapper })
    expect(result.current.openIds).toEqual([])
    expect(result.current.activeId).toBeNull()
  })

  it("opens a tab via dispatch", () => {
    const { result } = renderHook(() => useTabs(tabs), { wrapper })
    act(() => result.current.dispatch({ type: "open", id: "a" }))
    expect(result.current.openIds).toEqual(["a"])
  })

  it("closes a tab via dispatch", () => {
    const { result } = renderHook(() => useTabs(tabs), { wrapper })
    act(() => result.current.dispatch({ type: "open", id: "a" }))
    act(() => result.current.dispatch({ type: "open", id: "b" }))
    act(() => result.current.dispatch({ type: "close", id: "a" }))
    expect(result.current.openIds).toEqual(["b"])
  })

  it("activates a tab", () => {
    const { result } = renderHook(() => useTabs(tabs), { wrapper })
    act(() => result.current.dispatch({ type: "open", id: "a" }))
    act(() => result.current.dispatch({ type: "open", id: "b" }))
    act(() => result.current.dispatch({ type: "activate", id: "a" }))
    expect(result.current.activeId).toBe("a")
  })
})
