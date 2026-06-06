export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function nameListOptions(
  tasks: { supplierId: string; bookerId: string }[],
  field: "supplierId" | "bookerId",
  current?: string,
): string[] {
  const opts = tasks.map(t => t[field]).filter(Boolean) as string[]
  if (current) opts.push(current)
  return [...new Set(opts)]
}

export function urgencyLabel(u: number): string {
  return u >= 3 ? "!" : u === 1 ? "X" : String(u)
}

export function dateLabel(d: string): string {
  if (!d || d.length !== 10) return ""
  const [y, mo, da] = d.split("-").map(Number)
  const dt = new Date(y, mo - 1, da)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  const wd = ["日", "一", "二", "三", "四", "五", "六"][dt.getDay()]
  const diff = Math.round((dt.getTime() - today.getTime()) / 86400000)
  return diff === 0 ? `${mm}-${dd} ${wd}` : `${mm}-${dd} ${wd} ${diff > 0 ? "+" : ""}${diff}`
}
