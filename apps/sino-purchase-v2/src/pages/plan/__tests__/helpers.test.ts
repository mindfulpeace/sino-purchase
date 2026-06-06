import { describe, expect, test, vi, beforeEach, afterEach } from "vitest"
import { todayISO, nameListOptions, urgencyLabel, dateLabel } from "../helpers"

describe("todayISO", () => {
  test("应该返回 YYYY-MM-DD 格式的日期", () => {
    const result = todayISO()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe("nameListOptions", () => {
  test("应该提取字段值并去重", () => {
    const tasks = [
      { supplierId: "A", bookerId: "X" },
      { supplierId: "B", bookerId: "Y" },
      { supplierId: "A", bookerId: "X" },
    ]
    expect(nameListOptions(tasks, "supplierId")).toEqual(["A", "B"])
    expect(nameListOptions(tasks, "bookerId")).toEqual(["X", "Y"])
  })

  test("应该包含当前值", () => {
    const tasks = [{ supplierId: "A", bookerId: "X" }]
    expect(nameListOptions(tasks, "supplierId", "C")).toEqual(["A", "C"])
  })

  test("应该过滤掉空值", () => {
    const tasks = [
      { supplierId: "A", bookerId: "" },
      { supplierId: undefined as any, bookerId: "X" },
      { supplierId: null as any, bookerId: null as any },
    ]
    expect(nameListOptions(tasks, "supplierId")).toEqual(["A"])
    expect(nameListOptions(tasks, "bookerId")).toEqual(["X"])
  })
})

describe("urgencyLabel", () => {
  test("应该返回 ! 当 >= 3", () => {
    expect(urgencyLabel(3)).toBe("!")
    expect(urgencyLabel(5)).toBe("!")
  })

  test("应该返回 X 当 === 1", () => {
    expect(urgencyLabel(1)).toBe("X")
  })

  test("应该返回数字字符串其他情况", () => {
    expect(urgencyLabel(0)).toBe("0")
    expect(urgencyLabel(2)).toBe("2")
  })
})

describe("dateLabel", () => {
  // Mock today
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-06-15"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("应该返回空字符串当日期无效", () => {
    expect(dateLabel("")).toBe("")
    expect(dateLabel("2024")).toBe("")
  })

  test("应该格式化今天的日期", () => {
    // 2024-06-15 是周六
    expect(dateLabel("2024-06-15")).toBe("06-15 六")
  })

  test("应该格式化昨天的日期", () => {
    expect(dateLabel("2024-06-14")).toBe("06-14 五 -1")
  })

  test("应该格式化明天的日期", () => {
    expect(dateLabel("2024-06-16")).toBe("06-16 日 +1")
  })
})