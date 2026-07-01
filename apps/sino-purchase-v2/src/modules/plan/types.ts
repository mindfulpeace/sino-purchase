export type TaskStatus = 1 | 2 | 3 | 4 | 5
export type SupportedCurrency = "ZMW" | "USD" | "CNY"
export type TaxStatus = "可抵扣" | "入成本" | "无税" | "无据" | "伙食"

export const TAX_STATUS_OPTIONS: { value: TaxStatus; label: string }[] = [
  { value: "可抵扣", label: "可抵扣" },
  { value: "入成本", label: "入成本" },
  { value: "无税", label: "无税" },
  { value: "无据", label: "无据" },
  { value: "伙食", label: "伙食" },
]

export type Urgency = 1 | 2 | 3 | 4 | 5

export interface PurchaseTask extends Record<string, unknown> {
  id: string
  name: string
  brand: string
  spec: string
  quantity: number
  unit: string
  unitPrice: number
  taxStatus: TaxStatus
  currency: SupportedCurrency
  exchangeRate: number
  supplierId: string
  bookerId: string
  status: TaskStatus
  urgency: Urgency
  createdAt: number
  plannedDate: string
  receivedDate: string
  reimbursementDate: string
  updatedAt: number
}

export const TASK_HEADERS: string[] = [
  "id", "name", "brand", "spec", "quantity", "unit", "unitPrice",
  "taxStatus", "currency", "exchangeRate", "supplierId", "bookerId",
  "status", "urgency", "createdAt", "plannedDate", "receivedDate",
  "reimbursementDate", "updatedAt",
]

export const NUMERIC_FIELDS = new Set<keyof PurchaseTask>([
  "quantity", "unitPrice", "exchangeRate", "urgency", "status",
  "createdAt", "updatedAt",
])

export const DATE_FIELDS = new Set<keyof PurchaseTask>([
  "plannedDate", "receivedDate", "reimbursementDate",
])

export const ALL_STATUSES: TaskStatus[] = [1, 2, 3, 4, 5]
export const STATUS_LABEL_CN: Record<number, string> = { 1: "计划", 2: "预留", 3: "已收", 4: "取消", 5: "记账" }
export const STATUS_BADGE: Record<number, string> = { 1: "-", 2: "H", 3: "D", 4: "C", 5: "B" }
export const STATUS_COLORS: Record<number, string> = { 1: "#2a4a6e", 2: "#1a3452", 3: "#238636", 4: "#6e40c9", 5: "#0d4018" }
export const URGENCY_COLORS: Record<number, string> = { 1: "#2b2b4a", 2: "#2b2b4a", 3: "#9e6a03", 4: "#bd561d", 5: "#da3633" }

const SYMBOLS: Record<SupportedCurrency, string> = { ZMW: "k", USD: "$", CNY: "¥" }
export function currencySymbol(ccy: SupportedCurrency): string {
  return SYMBOLS[ccy]
}

export type GroupBy = "plannedDate" | "status" | "urgency" | "supplier" | "booker" | "none"
export type SortBy =
  | "createdAt" | "plannedDate" | "status" | "urgency" | "supplierId" | "bookerId"
  | "receivedDate" | "reimbursementDate" | "unitPrice" | "currency" | "taxStatus"
  | "name" | "brand" | "spec" | "quantity" | "unit" | "updatedAt"
