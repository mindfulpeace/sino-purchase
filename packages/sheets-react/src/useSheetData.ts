import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { loadTable, insertRow, updateRow, deleteRow, findRow, appendRows, batchUpdateRows } from "@sino-purchase/sheets-core"
import { isLoggedIn, onTokenChange } from "@sino-purchase/sheets-core"
import { enqueue } from "@sino-purchase/sheets-core"

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

  // 审计 P1-3：用「内容序列化」后的稳定 key 作为 effect 依赖，而非 headers/numericFields/
  // dateFields/demoData 的对象引用。否则调用方传入内联字面量时每次渲染都是新引用，
  // 会触发 effect 无限重载（隐藏脚枪）。仅当内容真正变化（改表头/改字段）时才重载。
  const configKey = useMemo(() => {
    const nums = numericFields ? [...numericFields].join(",") : ""
    const dates = dateFields ? [...dateFields].join(",") : ""
    return [sheetName, headers.join(","), nums, dates, demoData?.length ?? 0].join("|")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetName, demoData?.length ?? 0, JSON.stringify(headers), JSON.stringify([...numericFields ?? []]), JSON.stringify([...dateFields ?? []])])

  const dataRef = useRef(data)
  // 审计 P0-3：缓存 loadTable 返回的 id→行号 映射，写操作直接用行号，
  // 避免 findRow 每次全列扫描；映射与云端行号保持一致，杜绝数据漂移。
  const rowMapRef = useRef<Map<string, number>>(new Map())
  // 云端真实表头：写回时按云端列顺序组装行，避免与本地 headers 顺序不一致导致写错位
  const rowHeadersRef = useRef<string[]>([])

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
      rowMapRef.current = r.rowMap
      rowHeadersRef.current = r.rowHeaders
      setData(r.data)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [loadKey, configKey])

  useEffect(() => {
    return onTokenChange(token => {
      if (token) reload()
    })
  }, [reload])

  const isDemo = !isLoggedIn()

  // 解析某条记录的云端行号：优先用缓存的 rowMap，缺失时回退到一次 findRow 并回填缓存。
  const resolveRow = useCallback(async (id: string): Promise<number | null> => {
    const cached = rowMapRef.current.get(id)
    if (cached) return cached
    const ri = await findRow(sheetName, id)
    if (ri) rowMapRef.current.set(id, ri)
    return ri
  }, [sheetName])

  // 写回列顺序以云端真实表头为准；未登录（demo）或尚未加载云端表头时回退到本地 headers
  const writeHeaders = () => rowHeadersRef.current.length > 0 ? rowHeadersRef.current : (headers as string[])

  const add = useCallback((partial: Partial<T>) => {
    const now = Date.now()
    const id = crypto.randomUUID()
    const record = { ...partial, [idField]: id, createdAt: now, updatedAt: now } as unknown as T
    setData(prev => [record, ...prev])
    if (!isLoggedIn()) return
    insertRow(sheetName, record as Record<string, unknown>, writeHeaders())
      .then(rowNum => { if (rowNum) rowMapRef.current.set(id, rowNum) })
      .catch(() => enqueue({ sheet: sheetName, op: "insert", data: record as Record<string, unknown> }))
  }, [sheetName, idField])

  const update = useCallback((id: string, changes: Partial<T>) => {
    const existing = dataRef.current.find(d => String(d[idField]) === id)
    if (!existing) return
    const merged = { ...existing, ...changes, updatedAt: Date.now() } as T
    setData(prev => prev.map(d => String(d[idField]) === id ? merged : d))
    if (!isLoggedIn()) return
    resolveRow(id).then(ri => {
      if (!ri) return // 本地新增但未同步到云端，无需云端更新
      updateRow(sheetName, ri, merged as Record<string, unknown>, writeHeaders())
        .catch(() => enqueue({
          sheet: sheetName, op: "update", rowIndex: ri,
          data: merged as Record<string, unknown>, headers: writeHeaders(),
        }))
    })
  }, [sheetName, idField, resolveRow])

  const remove = useCallback((id: string) => {
    const dataBefore = dataRef.current.find(d => String(d[idField]) === id)
    setData(prev => prev.filter(d => String(d[idField]) !== id))
    if (!isLoggedIn()) return
    resolveRow(id).then(ri => {
      if (!ri) return // 仅本地数据，无云端行可删
      deleteRow(sheetName, ri)
        .catch(() => {
          if (dataBefore) enqueue({ sheet: sheetName, op: "delete", rowIndex: ri, data: dataBefore as Record<string, unknown> })
        })
    })
  }, [sheetName, idField, resolveRow])

  // 审计 P1-5：批量新增——一次 appendRows 请求写多行，替代逐条 add。
  const batchAdd = useCallback(async (partials: Partial<T>[]) => {
    if (partials.length === 0) return
    const now = Date.now()
    const records = partials.map((p, i) => {
      const id = crypto.randomUUID()
      // createdAt 随粘贴下标单调递增，编码「粘贴顺序」，保证批量导入后多行相对顺序与源一致
      return { ...p, [idField]: id, createdAt: now + i, updatedAt: now + i } as unknown as T
    })
    setData(prev => [...records, ...prev])
    if (!isLoggedIn()) return
    try {
      const firstRow = await appendRows(sheetName, records as Record<string, unknown>[], writeHeaders())
      // appendRows 返回首行号，云端行号连续，逐行回填 rowMap
      if (firstRow) records.forEach((r, i) => rowMapRef.current.set(String(r[idField]), firstRow + i))
    } catch {
      // 失败降级为逐条 enqueue，保持离线/容错语义
      for (const r of records) enqueue({ sheet: sheetName, op: "insert", data: r as Record<string, unknown> })
    }
  }, [sheetName, idField])

  // 审计 P1-5：批量更新——一次 batchUpdateRows 请求写多行，替代逐条 update。
  const batchUpdate = useCallback(async (items: { id: string; changes: Partial<T> }[]) => {
    if (items.length === 0) return
    // 先乐观算出合并结果并乐观更新本地
    const mergedMap = new Map<string, T>()
    for (const { id, changes } of items) {
      const existing = dataRef.current.find(d => String(d[idField]) === id)
      if (!existing) continue
      mergedMap.set(id, { ...existing, ...changes, updatedAt: Date.now() } as T)
    }
    if (mergedMap.size === 0) return
    setData(prev => prev.map(d => {
      const id = String(d[idField])
      return mergedMap.has(id) ? (mergedMap.get(id) as T) : d
    }))
    if (!isLoggedIn()) return
    try {
      const writes: { rowIndex: number; values: Record<string, unknown> }[] = []
      for (const { id } of items) {
        const merged = mergedMap.get(id)
        if (!merged) continue
        const ri = await resolveRow(id)
        if (ri) writes.push({ rowIndex: ri, values: merged as Record<string, unknown> })
      }
      if (writes.length) await batchUpdateRows(sheetName, writes, writeHeaders())
    } catch {
      // 失败降级为逐条 enqueue
      for (const { id } of items) {
        const merged = mergedMap.get(id)
        if (!merged) continue
        const ri = await resolveRow(id)
        if (ri) enqueue({ sheet: sheetName, op: "update", rowIndex: ri, data: merged as Record<string, unknown>, headers: writeHeaders() })
      }
    }
  }, [sheetName, idField, resolveRow])

  return { data, loading, reload, add, update, remove, batchAdd, batchUpdate, isDemo }
}
