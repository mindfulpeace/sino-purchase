import type { PurchaseTask } from "../modules/plan/types"
import type { CashRecord } from "../modules/accounting/types"

const now = Date.now()
const day = 86400000
const today = new Date().toISOString().slice(0, 10)
const daysAgo = (n: number) => new Date(now - n * day).toISOString().slice(0, 10)
const daysAhead = (n: number) => new Date(now + n * day).toISOString().slice(0, 10)

function uid(): string {
  return crypto.randomUUID()
}

/* ── Plan: 采购任务 demo 数据 ── */

export const DEMO_TASKS: PurchaseTask[] = [
  {
    id: uid(), name: "液压油缸", brand: "Parker", spec: "HSG-100/60-300",
    quantity: 4, unit: "个", unitPrice: 1850, taxStatus: "可抵扣",
    currency: "USD", exchangeRate: 1, supplierId: "Atlas Copco", bookerId: "Max",
    status: 1, urgency: 4, createdAt: now - 2 * day, plannedDate: daysAhead(3),
    receivedDate: "", reimbursementDate: "", updatedAt: now - 2 * day,
  },
  {
    id: uid(), name: "装载机轮胎", brand: "Michelin", spec: "23.5R25 XHA2",
    quantity: 2, unit: "条", unitPrice: 4200, taxStatus: "入成本",
    currency: "USD", exchangeRate: 1, supplierId: "Tyrerite", bookerId: "金涛",
    status: 1, urgency: 5, createdAt: now - 1 * day, plannedDate: daysAhead(1),
    receivedDate: "", reimbursementDate: "", updatedAt: now - 1 * day,
  },
  {
    id: uid(), name: "柴油滤芯", brand: "Baldwin", spec: "BF7633",
    quantity: 20, unit: "个", unitPrice: 45, taxStatus: "可抵扣",
    currency: "USD", exchangeRate: 1, supplierId: "AutoDuty", bookerId: "Max",
    status: 2, urgency: 3, createdAt: now - 3 * day, plannedDate: daysAgo(1),
    receivedDate: "", reimbursementDate: "", updatedAt: now - 3 * day,
  },
  {
    id: uid(), name: "球阀", brand: "", spec: "DN50 304不锈钢",
    quantity: 10, unit: "个", unitPrice: 320, taxStatus: "可抵扣",
    currency: "CNY", exchangeRate: 7.2, supplierId: "温州阀门厂", bookerId: "金涛",
    status: 3, urgency: 2, createdAt: now - 5 * day, plannedDate: daysAgo(3),
    receivedDate: daysAgo(1), reimbursementDate: "", updatedAt: now - 1 * day,
  },
  {
    id: uid(), name: "电焊条", brand: "金桥", spec: "J422 φ3.2",
    quantity: 50, unit: "kg", unitPrice: 28, taxStatus: "入成本",
    currency: "CNY", exchangeRate: 7.2, supplierId: "卢萨卡五金", bookerId: "Max",
    status: 3, urgency: 2, createdAt: now - 7 * day, plannedDate: daysAgo(4),
    receivedDate: daysAgo(2), reimbursementDate: daysAgo(1), updatedAt: now - 1 * day,
  },
  {
    id: uid(), name: "角磨机", brand: "Bosch", spec: "GWS 9-125 S",
    quantity: 5, unit: "台", unitPrice: 95, taxStatus: "可抵扣",
    currency: "USD", exchangeRate: 1, supplierId: "AutoDuty", bookerId: "Max",
    status: 5, urgency: 3, createdAt: now - 10 * day, plannedDate: daysAgo(6),
    receivedDate: daysAgo(3), reimbursementDate: daysAgo(1), updatedAt: now - 1 * day,
  },
  {
    id: uid(), name: "机油", brand: "Shell", spec: "Rimula R5 15W-40 208L",
    quantity: 3, unit: "桶", unitPrice: 680, taxStatus: "可抵扣",
    currency: "USD", exchangeRate: 1, supplierId: "Shell Lusaka", bookerId: "金涛",
    status: 1, urgency: 3, createdAt: now - 1 * day, plannedDate: daysAhead(5),
    receivedDate: "", reimbursementDate: "", updatedAt: now - 1 * day,
  },
  {
    id: uid(), name: "螺栓 M16", brand: "", spec: "8.8级 镀锌",
    quantity: 200, unit: "套", unitPrice: 12, taxStatus: "入成本",
    currency: "CNY", exchangeRate: 7.2, supplierId: "温州紧固件", bookerId: "Max",
    status: 4, urgency: 1, createdAt: now - 6 * day, plannedDate: daysAgo(2),
    receivedDate: "", reimbursementDate: "", updatedAt: now - 5 * day,
  },
  {
    id: uid(), name: "安全帽", brand: "3M", spec: "H-700 黄色",
    quantity: 30, unit: "顶", unitPrice: 22, taxStatus: "无税",
    currency: "USD", exchangeRate: 1, supplierId: "SafetyFirst", bookerId: "Max",
    status: 3, urgency: 2, createdAt: now - 8 * day, plannedDate: daysAgo(5),
    receivedDate: daysAgo(3), reimbursementDate: "", updatedAt: now - 3 * day,
  },
  {
    id: uid(), name: "发电机滤芯", brand: "Caterpillar", spec: "1R-0741",
    quantity: 8, unit: "个", unitPrice: 185, taxStatus: "可抵扣",
    currency: "USD", exchangeRate: 1, supplierId: "Cat Dealer", bookerId: "金涛",
    status: 2, urgency: 4, createdAt: now - 4 * day, plannedDate: today,
    receivedDate: "", reimbursementDate: "", updatedAt: now - 4 * day,
  },
  {
    id: uid(), name: "钢管", brand: "", spec: "Φ89×4 无缝 6m/根",
    quantity: 15, unit: "根", unitPrice: 450, taxStatus: "入成本",
    currency: "CNY", exchangeRate: 7.2, supplierId: "温州钢材", bookerId: "Max",
    status: 1, urgency: 3, createdAt: now - 0.5 * day, plannedDate: daysAhead(7),
    receivedDate: "", reimbursementDate: "", updatedAt: now - 0.5 * day,
  },
  {
    id: uid(), name: "劳保手套", brand: "", spec: "帆布 加厚",
    quantity: 100, unit: "双", unitPrice: 8, taxStatus: "无税",
    currency: "CNY", exchangeRate: 7.2, supplierId: "卢萨卡五金", bookerId: "Max",
    status: 5, urgency: 1, createdAt: now - 12 * day, plannedDate: daysAgo(8),
    receivedDate: daysAgo(5), reimbursementDate: daysAgo(2), updatedAt: now - 2 * day,
  },
]

/* ── Accounting: 现金日记账 demo 数据 ── */

export const DEMO_RECORDS: CashRecord[] = [
  { id: uid(), date: daysAgo(1), description: "Atlas Copco 液压油缸定金", amount: 7400, tax: "可抵扣", type: "采购", batch: "2026-07", note: "USD 1850×4" },
  { id: uid(), date: daysAgo(1), description: "Shell 机油 3桶", amount: 2040, tax: "可抵扣", type: "采购", batch: "2026-07", note: "USD 680×3" },
  { id: uid(), date: daysAgo(2), description: "卢萨卡五金 电焊条", amount: 1400, tax: "入成本", type: "采购", batch: "2026-07", note: "CNY 28×50kg" },
  { id: uid(), date: daysAgo(2), description: "SafetyFirst 安全帽", amount: 660, tax: "无税", type: "采购", batch: "2026-07", note: "USD 22×30" },
  { id: uid(), date: daysAgo(3), description: "温州阀门厂 球阀", amount: 3200, tax: "可抵扣", type: "采购", batch: "2026-06", note: "CNY 320×10" },
  { id: uid(), date: daysAgo(3), description: "AutoDuty 角磨机", amount: 475, tax: "可抵扣", type: "采购", batch: "2026-06", note: "USD 95×5" },
  { id: uid(), date: daysAgo(4), description: "Cat Dealer 发电机滤芯", amount: 1480, tax: "可抵扣", type: "采购", batch: "2026-06", note: "USD 185×8" },
  { id: uid(), date: daysAgo(5), description: "温州紧固件 螺栓", amount: 2400, tax: "入成本", type: "采购", batch: "2026-06", note: "CNY 12×200套（取消）" },
  { id: uid(), date: daysAgo(5), description: "办公用品", amount: 350, tax: "无据", type: "办公", batch: "2026-06", note: "打印纸、笔" },
  { id: uid(), date: daysAgo(6), description: "员工午餐", amount: 200, tax: "伙食", type: "伙食", batch: "2026-06", note: "食堂采购" },
  { id: uid(), date: daysAgo(7), description: "Tyrerite 装载机轮胎定金", amount: 4200, tax: "入成本", type: "采购", batch: "2026-06", note: "USD 4200×1" },
  { id: uid(), date: daysAgo(8), description: "Baldwin 柴油滤芯", amount: 900, tax: "可抵扣", type: "采购", batch: "2026-06", note: "USD 45×20" },
  { id: uid(), date: daysAgo(10), description: "物流运费", amount: 1800, tax: "入成本", type: "物流", batch: "2026-06", note: "卢萨卡→矿区" },
  { id: uid(), date: daysAgo(12), description: "温州钢材 钢管", amount: 6750, tax: "入成本", type: "采购", batch: "2026-06", note: "CNY 450×15根" },
  { id: uid(), date: daysAgo(15), description: "员工交通", amount: 150, tax: "无据", type: "交通", batch: "2026-06", note: "出租车" },
]
