import { describe, expect, test, vi } from "vitest"
import { parseCsvLine, csvToTabSeparated, parseTabData } from "../dataParser"

vi.mock("../sheetjs", () => ({
  cryptoRandomId: () => "test-id-123",
}))

describe("parseCsvLine", () => {
  test("应该解析简单的 CSV 行", () => {
    expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"])
  })

  test("应该解析带引号的字段", () => {
    expect(parseCsvLine('"a,b",c,"d"')).toEqual(["a,b", "c", "d"])
  })

  test("应该处理空字段", () => {
    expect(parseCsvLine("a,,c")).toEqual(["a", "", "c"])
  })

  test("应该处理首尾空格", () => {
    expect(parseCsvLine("  a  ,  b  ")).toEqual(["a", "b"])
  })
})

describe("csvToTabSeparated", () => {
  test("应该转换为制表符分隔", () => {
    expect(csvToTabSeparated("a,b,c\n1,2,3")).toBe("a\tb\tc\n1\t2\t3")
  })
})

describe("parseTabData", () => {
  test("应该解析有效的 tab 数据", () => {
    const data = "id\t日期\t金额\n1\t2024-01-01\t100"
    const result = parseTabData(data)
    expect(result.length).toBe(1)
    expect(result[0].date).toBe("2024-01-01")
    expect(result[0].amount).toBe(100)
  })

  test("应该处理中文表头", () => {
    const data = "编号\t日期\t数额\n1\t2024-01-01\t100"
    const result = parseTabData(data)
    expect(result.length).toBe(1)
  })

  test("应该抛出错误当缺少必填字段", () => {
    const data = "id\t日期\n1\t2024-01-01"
    expect(() => parseTabData(data)).toThrow("缺少必需字段")
  })

  test("应该抛出错误当数据格式不正确", () => {
    expect(() => parseTabData("")).toThrow("数据格式不正确")
    expect(() => parseTabData("id")).toThrow("数据格式不正确")
  })
})
