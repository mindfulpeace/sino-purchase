export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDataSummary(records: { amount: number }[]): string {
  const count = records.length
  const total = records.reduce((sum, r) => sum + (r.amount || 0), 0)
  return `${count} 条 / ${formatAmount(total)}`
}
