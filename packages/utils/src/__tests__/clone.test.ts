import { describe, expect, test } from "vitest"
import { deepClone } from "../clone"

describe("deepClone", () => {
  test("应该克隆基础类型", () => {
    expect(deepClone(123)).toBe(123)
    expect(deepClone("hello")).toBe("hello")
    expect(deepClone(null)).toBe(null)
    expect(deepClone(undefined)).toBe(undefined)
  })

  test("应该克隆简单对象", () => {
    const obj = { a: 1, b: "test" }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj) // 引用不同
  })

  test("应该克隆嵌套对象", () => {
    const obj = { a: { b: { c: 1 } } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned.a).not.toBe(obj.a) // 嵌套对象也应该是不同引用
  })

  test("应该克隆数组", () => {
    const arr = [1, 2, 3, { a: 1 }]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
    expect(cloned[3]).not.toBe(arr[3])
  })

  test("应该克隆 Date 对象", () => {
    const date = new Date("2024-01-01")
    const cloned = deepClone(date)
    expect(cloned).toEqual(date)
    expect(cloned).not.toBe(date)
    expect(cloned.getTime()).toBe(date.getTime())
  })
})