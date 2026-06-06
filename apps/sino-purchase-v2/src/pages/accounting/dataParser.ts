import type { CashRecord } from "./types"
import { cryptoRandomId } from "./sheetjs"

const FIELD_MAP: Record<string, string> = {
  "id": "id", "编号": "id", "ID": "id",
  "日期": "date",
  "税务处理": "tax", "税务": "tax",
  "描述": "description", "说明": "description",
  "金额": "amount", "数额": "amount",
  "类型": "type",
  "批次": "batch",
  "备注": "note",
}

const REQUIRED_FIELDS = ["id", "date", "amount"]

export const parseCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export const csvToTabSeparated = (csv: string): string => {
  return csv.trim()
    .split(/\r?\n/)
    .map(line => parseCsvLine(line).join("\t"))
    .join("\n")
}

const parseDate = (dateStr: string, currentYear: number): string => {
  const date = dateStr?.trim() || ""

  if (/^\d+-\d+$/.test(date)) {
    const [month, day] = date.split("-")
    return `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  if (/^\d+\/\d+\/\d+$/.test(date)) {
    const [month, day, year] = date.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  return date
}

const getFieldIndex = (headers: string[], field: string): number => {
  return headers.findIndex(h => FIELD_MAP[h] === field)
}

export const parseTabData = (text: string): CashRecord[] => {
  const lines = text.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("数据格式不正确")
  }

  const headers = lines[0].trim().split("\t").map(h => h.trim())

  const getIndex = (field: string) => getFieldIndex(headers, field)
  const fieldIndexes = {
    id: getIndex("id"),
    date: getIndex("date"),
    tax: getIndex("tax"),
    description: getIndex("description"),
    amount: getIndex("amount"),
    type: getIndex("type"),
    batch: getIndex("batch"),
  }

  if (REQUIRED_FIELDS.some(f => fieldIndexes[f as keyof typeof fieldIndexes] === -1)) {
    throw new Error("缺少必需字段（id、日期、金额）")
  }

  const currentYear = new Date().getFullYear()
  const result: CashRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split("\t").map(v => v.trim())
    const maxIndex = Math.max(fieldIndexes.id, fieldIndexes.date, fieldIndexes.amount)

    if (values.length > maxIndex) {
      result.push({
        id: cryptoRandomId(),
        date: parseDate(values[fieldIndexes.date], currentYear),
        description: fieldIndexes.description !== -1 ? values[fieldIndexes.description] : "",
        amount: Math.abs(parseFloat(values[fieldIndexes.amount].replace(/[^\d.-]/g, "")) || 0),
        tax: fieldIndexes.tax !== -1 && values[fieldIndexes.tax] ? values[fieldIndexes.tax] : "无税",
        type: fieldIndexes.type !== -1 && values[fieldIndexes.type] ? values[fieldIndexes.type] : "其他",
        batch: fieldIndexes.batch !== -1 && values[fieldIndexes.batch] ? values[fieldIndexes.batch] : "",
        note: "",
      })
    }
  }

  return result
}
