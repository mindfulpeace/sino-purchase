import { useState, useEffect, useCallback, useRef } from "react"
import { loadTable, insertRow, updateRow, deleteRow } from "./db"
import { isLoggedIn } from "./auth"
import { enqueue } from "./sync-queue"

export interface UseSheetDataConfig<T extends Record<string, unknown>> {
  sheetName: string
  headers: (keyof T & string)[]
  numericFields?: Set<keyof T>
  dateFields?: Set<keyof T>
  idField?: keyof T
}

export function useSheetData<T extends Record<string, unknown>>(config: UseSheetDataConfig<T>) {
  const { sheetName, headers, numericFields, dateFields, idField = "id" as keyof T } = config

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [loadKey, setLoadKey] = useState(0)

  const rowMapRef = useRef(new Map<string, number>())
  const dataRef = useRef(data)

  useEffect(() => { dataRef.current = data }, [data])

  const reload = useCallback(() => {
    setLoading(true)
    setLoadKey(k => k + 1)
  }, [])

  useEffect(() => {
    if (!isLoggedIn()) return
    let cancelled = false
    loadTable<T>(sheetName, headers as string[], numericFields, dateFields).then(r => {
      if (cancelled) return
      setData(r.data)
      rowMapRef.current = r.rowMap
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [loadKey, sheetName, headers, numericFields, dateFields])

  const add = useCallback((partial: Partial<T>) => {
    const now = Date.now()
    const id = crypto.randomUUID()
    const record = { ...partial, [idField]: id, createdAt: now, updatedAt: now } as unknown as T
    setData(prev => [record, ...prev])
    insertRow(sheetName, record as Record<string, unknown>).catch(() => enqueue({ sheet: sheetName, op: "insert", data: record as Record<string, unknown> }))
  }, [sheetName, idField])

  const update = useCallback((id: string, changes: Partial<T>) => {
    const existing = dataRef.current.find(d => String(d[idField]) === id)
    if (!existing) return
    const merged = { ...existing, ...changes, updatedAt: Date.now() } as T
    const ri = rowMapRef.current.get(id)
    setData(prev => prev.map(d => String(d[idField]) === id ? merged : d))
    if (ri) {
      updateRow(sheetName, ri, merged as Record<string, unknown>, headers as string[]).catch(() => enqueue({ sheet: sheetName, op: "update", rowIndex: ri, data: merged as Record<string, unknown>, headers: headers as string[] }))
    }
  }, [sheetName, headers, idField])

  const remove = useCallback((id: string) => {
    const ri = rowMapRef.current.get(id)
    setData(prev => prev.filter(d => String(d[idField]) !== id))
    if (ri) deleteRow(sheetName, ri).catch(() => enqueue({ sheet: sheetName, op: "delete", rowIndex: ri }))
  }, [sheetName, idField])

  return { data, loading, reload, add, update, remove }
}
