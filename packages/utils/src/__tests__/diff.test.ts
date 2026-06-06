import { describe, expect, test } from "vitest"
import { calculateDiff } from "../diff"

describe("calculateDiff", () => {
  test("应该计算空数据的差异", () => {
    const result = calculateDiff([], [])
    expect(result).toEqual({ added: [], modified: [], deleted: [] })
  })

  test("应该计算新增的数据", () => {
    const original = [{ id: 1, name: "A" }]
    const current = [{ id: 1, name: "A" }, { id: 2, name: "B" }]
    const result = calculateDiff(original, current)
    expect(result.added).toEqual([{ id: 2, name: "B" }])
  })

  test("应该计算删除的数据", () => {
    const original = [{ id: 1, name: "A" }, { id: 2, name: "B" }]
    const current = [{ id: 1, name: "A" }]
    const result = calculateDiff(original, current)
    expect(result.deleted).toEqual([2])
  })

  test("应该计算修改的数据", () => {
    const original = [{ id: 1, name: "A" }, { id: 2, name: "B" }]
    const current = [{ id: 1, name: "A" }, { id: 2, name: "Updated" }]
    const result = calculateDiff(original, current)
    expect(result.modified).toEqual([{ id: 2, name: "Updated" }])
  })

  test("应该同时计算新增、修改、删除", () => {
    const original = [{ id: 1, name: "A" }, { id: 2, name: "B" }, { id: 3, name: "C" }]
    const current = [{ id: 1, name: "Updated" }, { id: 3, name: "C" }, { id: 4, name: "D" }]
    const result = calculateDiff(original, current)
    expect(result.added).toEqual([{ id: 4, name: "D" }])
    expect(result.modified).toEqual([{ id: 1, name: "Updated" }])
    expect(result.deleted).toEqual([2])
  })

  test("如果数据完全相同，应该返回空差异", () => {
    const data = [{ id: 1, name: "A" }, { id: 2, name: "B" }]
    const result = calculateDiff(data, data)
    expect(result).toEqual({ added: [], modified: [], deleted: [] })
  })
})