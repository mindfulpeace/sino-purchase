import { describe, expect, test } from "vitest"
import { formatAmount, formatDataSummary } from "../helpers"

describe("formatAmount", () => {
  test("应该格式化正整数", () => {
    expect(formatAmount(100)).toBe("100.00")
  })

  test("应该格式化小数", () => {
    expect(formatAmount(123.45)).toBe("123.45")
  })

  test("应该保留两位小数，四舍五入", () => {
    expect(formatAmount(123.456)).toBe("123.46")
  })

  test("应该格式化零", () => {
    expect(formatAmount(0)).toBe("0.00")
  })

  test("应该格式化负数", () => {
    expect(formatAmount(-100)).toBe("-100.00")
  })
})

describe("formatDataSummary", () => {
  test("应该格式化空数组", () => {
    expect(formatDataSummary([])).toBe("0 条 / 0.00")
  })

  test("应该格式化单条记录", () => {
    expect(formatDataSummary([{ amount: 100 }])).toBe("1 条 / 100.00")
  })

  test("应该格式化多条记录", () => {
    expect(formatDataSummary([
      { amount: 100 },
      { amount: 200 },
      { amount: 300 },
    ])).toBe("3 条 / 600.00")
  })

  test("应该处理 amount 为 null/undefined 的情况", () => {
    expect(formatDataSummary([
      { amount: 100 },
      { amount: undefined as any },
      { amount: null as any },
    ])).toBe("3 条 / 100.00")
  })
})