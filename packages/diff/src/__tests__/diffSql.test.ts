import { describe, expect, test } from "vitest"
import { diffSql } from "../diffSql"
import type { DiffResult } from "../diff"

describe("diffSql", () => {
  test("应该生成空 SQL", () => {
    const diff: DiffResult<any> = { added: [], modified: [], deleted: [] }
    expect(diffSql("test_table", diff)).toBe("")
  })

  test("应该生成 INSERT SQL", () => {
    const diff: DiffResult<any> = {
      added: [{ id: 1, name: "Test" }],
      modified: [],
      deleted: []
    }
    const sql = diffSql("test_table", diff)
    expect(sql).toContain("INSERT INTO test_table")
    expect(sql).toContain("id, name")
    expect(sql).toContain("1, 'Test'")
  })

  test("应该生成 UPDATE SQL", () => {
    const diff: DiffResult<any> = {
      added: [],
      modified: [{ id: 1, name: "Updated" }],
      deleted: []
    }
    const sql = diffSql("test_table", diff)
    expect(sql).toContain("UPDATE test_table")
    expect(sql).toContain("name = 'Updated'")
    expect(sql).toContain("WHERE id = 1")
  })

  test("应该生成 DELETE SQL", () => {
    const diff: DiffResult<any> = {
      added: [],
      modified: [],
      deleted: [1, 2, 3]
    }
    const sql = diffSql("test_table", diff)
    expect(sql).toContain("DELETE FROM test_table")
    expect(sql).toContain("WHERE id IN (1, 2, 3)")
  })

  test("应该转义 SQL 字符串中的单引号", () => {
    const diff: DiffResult<any> = {
      added: [{ id: 1, name: "O'Neil" }],
      modified: [],
      deleted: []
    }
    const sql = diffSql("test_table", diff)
    expect(sql).toContain("'O''Neil'")
  })
})
