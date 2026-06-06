import { useMemo } from "react"
import type { CashRecord } from "./types"

export interface ReimburseGroup {
  tax: string
  batch: string
  date: string
  items: { detail: string; amount: number }[]
}

export function useReimburseData(records: CashRecord[]): { reimburseData: ReimburseGroup[] } {
  return useMemo(() => {
    const filteredData = records.filter((item) => item.batch)

    const groupedByBatch = filteredData.reduce<Record<string, CashRecord[]>>((acc, item) => {
      const key = item.batch
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

    const getLatestDate = (items: CashRecord[]) => {
      if (items.length === 0) return ""
      return items.reduce((latest, item) => {
        const itemDate = new Date(item.date)
        return itemDate > new Date(latest) ? item.date : latest
      }, items[0].date)
    }

    const reimburseData = Object.entries(groupedByBatch).flatMap(([batch, items]) => {
      const groupedByTax = items.reduce<Record<string, CashRecord[]>>((acc, item) => {
        const key = item.tax
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})

      return Object.entries(groupedByTax).map(([tax, taxItems]) => {
        const groupedByType = taxItems.reduce<Record<string, number>>((acc, item) => {
          const key = item.type
          acc[key] = (acc[key] || 0) + (Number(item.amount) || 0)
          return acc
        }, {})

        return {
          tax,
          batch,
          date: getLatestDate(taxItems),
          items: Object.entries(groupedByType).map(([detail, amount]) => ({
            detail,
            amount,
          })),
        }
      })
    })

    return { reimburseData }
  }, [records])
}
