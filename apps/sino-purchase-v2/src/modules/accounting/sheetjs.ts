import type { CashRecord } from "./types"

export function cryptoRandomId(): string {
  return crypto.randomUUID()
}

let _xlsx: typeof import("xlsx") | null = null

async function getXlsx() {
  if (!_xlsx) {
    _xlsx = await import("xlsx")
  }
  return _xlsx
}

export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
}

export async function exportExcel(data: CashRecord[], options: ExcelExportOptions = {}): Promise<void> {
  const XLSX = await getXlsx()
  const filename = options.filename || `明细_${new Date().toISOString().split("T")[0]}.xlsx`

  const worksheetData = data.map((item) => ({
    ID: item.id.slice(0, 8),
    日期: item.date,
    描述: item.description,
    金额: item.amount,
    税务: item.tax,
    类型: item.type,
    批次: item.batch,
    备注: item.note,
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  worksheet["!cols"] = [
    { wch: 8 }, { wch: 12 }, { wch: 30 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || "明细")
  XLSX.writeFile(workbook, filename)
}

export async function importFromExcel(file: File): Promise<CashRecord[]> {
  const XLSX = await getXlsx()

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

  return jsonData.map((row) => ({
    id: cryptoRandomId(),
    date: String(row["日期"] || row["date"] || ""),
    description: String(row["描述"] || row["description"] || ""),
    amount: Math.abs(parseFloat(String(row["金额"] || row["amount"] || 0))),
    tax: String(row["税务"] || row["tax"] || "无税"),
    type: String(row["类型"] || row["type"] || "其他"),
    batch: String(row["批次"] || row["batch"] || ""),
    note: String(row["备注"] || row["note"] || ""),
  }))
}
