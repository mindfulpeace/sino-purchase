import { useState, useEffect, useCallback, useRef } from "react"
import { loadTable, insertRow, updateRow, deleteRow, findRow } from "./db"
import { isLoggedIn, onTokenChange } from "./auth"
import { enqueue } from "./sync-queue"

export interface UseSheetDataConfig<T extends Record<string, unknown>> {
  sheetName: string
  headers: (keyof T & string)[]
  numericFields?: Set<keyof T>
  dateFields?: Set<keyof T>
  idField?: keyof T
  /** 未登录时使用的 demo 数据 */
  demoData?: T[]
}

export function useSheetData<T extends Record<string, unknown>>(config: UseSheetDataConfig<T>) {
  const { sheetName, headers, numericFields, dateFields, idField = "id" as keyof T, demoData } = config

  const [data, setData] = useState<T[]>(() => {
    if (!isLoggedIn() && demoData?.length) return demoData
    return []
  })
  const [loading, setLoading] = useState(true)
  const [loadKey, setLoadKey] = useState(0)

  const dataRef = useRef(data)

  useEffect(() => { dataRef.current = data }, [data])

  const reload = useCallback(() => {
    setLoading(true)
    setLoadKey(k => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!isLoggedIn()) {
      // Demo mode: use demoData if available
      if (demoData?.length) {
        setData(demoData)
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    setLoading(true)
    loadTable<T>(sheetName, headers as string[], numericFields, dateFields).then(r => {
      if (cancelled) return
      setData(r.data)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [loadKey, sheetName, headers, numericFields, dateFields, demoData])

  useEffect(() => {
    return onTokenChange(token => {
      if (token) reload()
    })
  }, [reload])

  const isDemo = !isLoggedIn()

  const add = useCallback((partial: Partial<T>) => {
    const now = Date.now()
    const id = crypto.randomUUID()
    const record = { ...partial, [idField]: id, createdAt: now, updatedAt: now } as unknown as T
    setData(prev => [record, ...prev])
    if (isDemo) return
    insertRow(sheetName, record as Record<string, unknown>).catch(() => enqueue({ sheet: sheetName, op: "insert", data: record as Record<string, unknown> }))
  }, [sheetName, idField, isDemo])

  const update = useCallback((id: string, changes: Partial<T>) => {
    const existing = dataRef.current.find(d => String(d[idField]) === id)
    if (!existing) return
    const merged = { ...existing, ...changes, updatedAt: Date.now() } as T
    setData(prev => prev.map(d => String(d[idField]) === id ? merged : d))
    if (isDemo) return
    findRow(sheetName, id).then(ri => {
      if (ri) updateRow(sheetName, ri, merged as Record<string, unknown>, headers as string[]).catch(() => enqueue({ sheet: sheetName, op: "update", rowIndex: ri, data: merged as Record<string, unknown>, headers: headers as string[] }))
    })
  }, [sheetName, headers, idField, isDemo])

  const remove = useCallback((id: string) => {
    const dataBefore = dataRef.current.find(d => String(d[idField]) === id)
    setData(prev => prev.filter(d => String(d[idField]) !== id))
    if (isDemo) return
    findRow(sheetName, id).then(ri => {
      if (ri) deleteRow(sheetName, ri).catch(() => {
        if (dataBefore) enqueue({ sheet: sheetName, op: "delete", data: dataBefore as Record<string, unknown> })
      })
    })
  }, [sheetName, idField, isDemo])

  return { data, loading, reload, add, update, remove, isDemo }
}
