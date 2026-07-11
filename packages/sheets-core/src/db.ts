import { getConfig } from "./config"
import { clearToken, requestToken } from "./auth"
import type { SyncOp } from "./types"
import { queueLen, loadQueue, saveRemaining, SYNC_ERROR_EVENT } from "./sync-queue"

const BASE = "https://sheets.googleapis.com/v4/spreadsheets"
const SHEET_META_TTL = 60_000
const REQUEST_TIMEOUT = 15_000
/** loadTable 单次拉取的最大行数（避免超长表无限读取） */
const MAX_SHEET_ROWS = 10_000

/** 携带 HTTP 状态的 API 错误，便于队列按错误类型分流（审计 P0-4） */
export class SheetsApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "SheetsApiError"
    this.status = status
  }
}

/**
 * 判断某次失败是否值得重试：
 *  - 0     = 网络中断 / 超时 / 请求被 abort（无 HTTP 响应）→ 重试
 *  - 429   = 限流 → 重试（调用方应配合退避）
 *  - >=500 = 服务端错误 → 重试
 *  - 401   = 令牌失效且本应用无 refresh token，只能由用户重新登录修复
 *            → 视为永久失败，丢弃出队并提示登录，避免无限重排
 *  - 其余 4xx（400/403/404/412...）= 永久业务错误 → 丢弃，不再重试
 */
export function isRetryableStatus(status: number): boolean {
  if (status === 0) return true
  if (status === 429 || status >= 500) return true
  return false
}

export async function processQueue(): Promise<{ retried: number; failed: number }> {
  const len = queueLen()
  if (len === 0) return { retried: 0, failed: 0 }
  const q = loadQueue()
  if (q.length === 0) return { retried: 0, failed: 0 }
  const remaining: SyncOp[] = []
  const failed: SyncOp[] = []
  for (const op of q) {
    try {
      if (op.op === "insert" && op.data) {
        await insertRow(op.sheet, op.data)
      } else if (op.op === "update" && op.rowIndex && op.data && op.headers) {
        await updateRow(op.sheet, op.rowIndex, op.data, op.headers)
      } else if (op.op === "delete" && op.rowIndex) {
        await deleteRow(op.sheet, op.rowIndex)
      } else {
        // 队列项结构不完整，无法执行 → 视为失败丢弃
        failed.push(op)
      }
    } catch (e) {
      const status = e instanceof SheetsApiError ? e.status : 0
      if (isRetryableStatus(status)) remaining.push(op)
      else failed.push(op)
    }
  }
  // 永久失败的写操作被丢弃（避免无限重排到 1000 条上限挤占配额）
  saveRemaining(remaining)
  if (failed.length > 0) {
    try {
      window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT, { detail: { count: failed.length } }))
    } catch { /* ignore */ }
  }
  return { retried: remaining.length, failed: failed.length }
}

async function fetchWithAuth<T = unknown>(url: string, opts: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  const doFetch = (token: string): Promise<Response> =>
    fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { ...opts.headers, Authorization: `Bearer ${token}` },
    })
  try {
    let token = await requestToken()
    if (!token) { clearToken(); throw new Error("unauthorized") }
    let res = await doFetch(token)
    if (res.status === 401) {
      // 无 refresh token，401 无法自愈：清理令牌并抛错，由上层提示重新登录
      clearToken()
      throw new SheetsApiError(401, "unauthorized")
    }
    if (!res.ok) throw new SheetsApiError(res.status, `Sheets API error: ${res.status}`)
    return (await res.json()) as T
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(`Sheets API request timeout after ${timeoutMs}ms`)
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

const sheetIdCache = new Map<string, number>()
let sheetMetaLoadedAt = 0
const headerCache = new Map<string, string[]>()

async function refreshSheetCache(force = false): Promise<void> {
  const now = Date.now()
  // 缓存带 TTL，避免每次 loadTable 都拉全表元数据（审计 P1-7）
  if (!force && sheetMetaLoadedAt && now - sheetMetaLoadedAt < SHEET_META_TTL) return
  const { spreadsheetId } = getConfig()
  const info = await fetchWithAuth<{ sheets?: Array<{ properties: { title: string; sheetId: number } }> }>(
    `${BASE}/${spreadsheetId}`,
  )
  sheetIdCache.clear()
  for (const s of info.sheets || []) {
    sheetIdCache.set(s.properties.title, s.properties.sheetId)
  }
  sheetMetaLoadedAt = now
}

async function getSheetId(name: string): Promise<number> {
  if (!sheetIdCache.has(name)) await refreshSheetCache(true)
  return sheetIdCache.get(name) ?? 0
}

async function getHeaders(sheetName: string): Promise<string[]> {
  if (headerCache.has(sheetName)) return headerCache.get(sheetName)!
  const { spreadsheetId } = getConfig()
  const res = await fetchWithAuth<{ values?: string[][] }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!1:1`,
  )
  const h = (res.values?.[0]) || []
  if (h.length) headerCache.set(sheetName, h)
  return h
}

function rowKey(offset: number): string {
  const n = 65 + offset
  if (offset < 26) return String.fromCharCode(n)
  return String.fromCharCode(64 + Math.floor(offset / 26)) + String.fromCharCode(65 + (offset % 26))
}

function normalizeDate(val: string): string {
  if (!val) return ""
  const parts = val.split(/[-/]/)
  if (parts.length !== 3) return val
  let y: string, m: string, d: string
  if (parts[0].length === 4) { y = parts[0]; m = parts[1]; d = parts[2] }
  else if (parts[2].length === 4) { y = parts[2]; m = parts[0]; d = parts[1] }
  else return val
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
}

async function ensureSheet(sheetName: string, headers: string[]): Promise<void> {
  const { spreadsheetId } = getConfig()
  if (!sheetIdCache.has(sheetName)) await refreshSheetCache(true)
  if (sheetIdCache.has(sheetName)) return
  await fetchWithAuth(`${BASE}/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: sheetName } } }] }),
  })
  await refreshSheetCache(true)
  if (headers.length > 0) {
    await fetchWithAuth(
      `${BASE}/${spreadsheetId}/values/${sheetName}!A1:${rowKey(headers.length - 1)}1?valueInputOption=USER_ENTERED`,
      { method: "PUT", body: JSON.stringify({ values: [headers] }) },
    )
    headerCache.set(sheetName, headers)
  }
}

export async function listSheets(): Promise<string[]> {
  if (sheetIdCache.size === 0) await refreshSheetCache(true)
  return Array.from(sheetIdCache.keys())
}

export async function findRow(sheetName: string, uuid: string): Promise<number | null> {
  const { spreadsheetId } = getConfig()
  const res = await fetchWithAuth<{ values?: string[][] }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!A:A`,
  )
  const rows = res.values || []
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === uuid) return i + 1
  }
  return null
}

export interface LoadTableResult<T> {
  data: T[]
  rowMap: Map<string, number>
  /** 云端真实表头（按读取顺序），写回时应以此为准，避免与本地 headers 顺序不一致导致错位 */
  rowHeaders: string[]
}

export async function loadTable<T extends Record<string, unknown>>(
  sheetName: string,
  headers: string[],
  numericFields?: Set<keyof T>,
  dateFields?: Set<keyof T>,
): Promise<LoadTableResult<T>> {
  const { spreadsheetId } = getConfig()
  await ensureSheet(sheetName, headers)
  const res = await fetchWithAuth<{ values?: string[][] }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!1:${MAX_SHEET_ROWS}`
  )
  const rows: string[][] = res.values || []
  if (rows.length < 2) return { data: [], rowMap: new Map(), rowHeaders: [] }

  const rowHeaders = rows[0]
  if (!headerCache.has(sheetName)) headerCache.set(sheetName, rowHeaders)
  const rowMap = new Map<string, number>()
  const seenIds = new Set<string>()

  const data = rows.slice(1).map((row, i) => {
    const obj: Record<string, unknown> = {}
    rowHeaders.forEach((h, ci) => {
      const val = row[ci]
      obj[h] = (numericFields?.has(h as keyof T) ? Number(val) || 0 : val || "")
    })
    if (dateFields) {
      for (const f of dateFields) {
        const key = f as string
        if (obj[key] && typeof obj[key] === "string") obj[key] = normalizeDate(obj[key] as string)
      }
    }
    let id = (obj.id as string) || crypto.randomUUID()
    while (seenIds.has(id)) id = crypto.randomUUID()
    seenIds.add(id)
    obj.id = id
    rowMap.set(id, i + 2)
    return obj as T
  })

  return { data, rowMap, rowHeaders: rowHeaders }
}

/**
 * 追加一行。返回新写入的行号（1-based），供上层维护 id→行号 映射，
 * 从而规避每次写操作都用 findRow 全列扫描（审计 P0-3 / P1-7）。
 */
export async function insertRow(sheetName: string, values: Record<string, unknown>, headersArg?: string[]): Promise<number> {
  const { spreadsheetId } = getConfig()
  const headers = (headersArg && headersArg.length > 0) ? headersArg : await getHeaders(sheetName)
  if (headers.length === 0) return 0
  const row = headers.map(h => {
    const v = values[h]
    return v === undefined || v === null ? "" : String(v)
  })
  const res = await fetchWithAuth<{ updates?: { updatedRange?: string } }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`,
    { method: "POST", body: JSON.stringify({ values: [row] }) },
  )
  const range = res.updates?.updatedRange || ""
  const m = range.match(/!([A-Z]+\d+):/i) ?? range.match(/!([A-Z]+\d+)$/i)
  const rowNum = m ? parseInt(m[1].replace(/[A-Z]/g, ""), 10) : 0
  if (rowNum) headerCache.set(sheetName, headers)
  return rowNum
}

export async function updateRow(
  sheetName: string,
  rowIndex: number,
  values: Record<string, unknown>,
  _headers: string[],
): Promise<void> {
  const { spreadsheetId } = getConfig()
  // 优先使用调用方传入的 headers（应为云端真实表头），缺失时回退缓存
  const headers = _headers.length > 0 ? _headers : await getHeaders(sheetName)
  if (headers.length === 0) return
  const col = rowKey(headers.length - 1)
  const row = headers.map(h => {
    const v = values[h]
    return v === undefined || v === null ? "" : String(v)
  })
  // 写失败立即重试一次，自愈瞬时网络/限流错误，避免改动滞留离线队列后刷新丢失
  try {
    await fetchWithAuth(
      `${BASE}/${spreadsheetId}/values/${sheetName}!A${rowIndex}:${col}${rowIndex}?valueInputOption=USER_ENTERED`,
      { method: "PUT", body: JSON.stringify({ values: [row] }) },
    )
  } catch (e) {
    if (e instanceof SheetsApiError && !isRetryableStatus(e.status)) throw e
    await fetchWithAuth(
      `${BASE}/${spreadsheetId}/values/${sheetName}!A${rowIndex}:${col}${rowIndex}?valueInputOption=USER_ENTERED`,
      { method: "PUT", body: JSON.stringify({ values: [row] }) },
    )
  }
}

export async function deleteRow(sheetName: string, rowIndex: number): Promise<void> {
  const { spreadsheetId } = getConfig()
  const sid = await getSheetId(sheetName)
  await fetchWithAuth(
    `${BASE}/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: { sheetId: sid, dimension: "ROWS", startIndex: rowIndex - 1, endIndex: rowIndex },
          },
        }],
      }),
    },
  )
}

/**
 * 审计 P1-5：批量追加多行——一次 `:append` 请求写入所有行，替代逐条 insertRow。
 * 返回首行号（云端行号连续），便于调用方回填 rowMap。
 */
export async function appendRows(
  sheetName: string,
  rows: Record<string, unknown>[],
  headersArg?: string[],
): Promise<number> {
  const { spreadsheetId } = getConfig()
  const headers = (headersArg && headersArg.length > 0) ? headersArg : await getHeaders(sheetName)
  if (headers.length === 0 || rows.length === 0) return 0
  const values = rows.map(r => headers.map(h => {
    const v = r[h]
    return v === undefined || v === null ? "" : String(v)
  }))
  const res = await fetchWithAuth<{ updates?: { updatedRange?: string } }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`,
    { method: "POST", body: JSON.stringify({ values }) },
  )
  const range = res.updates?.updatedRange || ""
  const m = range.match(/!([A-Z]+\d+):/i) ?? range.match(/!([A-Z]+\d+)$/i)
  const firstRow = m ? parseInt(m[1].replace(/[A-Z]/g, ""), 10) : 0
  if (firstRow) headerCache.set(sheetName, headers)
  return firstRow
}

/**
 * 审计 P1-5：批量更新多行——一次 `values:batchUpdate` 请求写入多个指定行，
 * 替代逐条 updateRow。写失败立即重试一次（与 updateRow 一致的自愈逻辑）。
 */
export async function batchUpdateRows(
  sheetName: string,
  writes: { rowIndex: number; values: Record<string, unknown> }[],
  headersArg?: string[],
): Promise<void> {
  const { spreadsheetId } = getConfig()
  const headers = (headersArg && headersArg.length > 0) ? headersArg : await getHeaders(sheetName)
  if (headers.length === 0 || writes.length === 0) return
  const col = rowKey(headers.length - 1)
  const data = writes.map(w => {
    const row = headers.map(h => {
      const v = w.values[h]
      return v === undefined || v === null ? "" : String(v)
    })
    return { range: `${sheetName}!A${w.rowIndex}:${col}${w.rowIndex}`, values: [row] }
  })
  try {
    await fetchWithAuth(
      `${BASE}/${spreadsheetId}/values:batchUpdate?valueInputOption=USER_ENTERED`,
      { method: "POST", body: JSON.stringify({ data }) },
    )
  } catch (e) {
    if (e instanceof SheetsApiError && !isRetryableStatus(e.status)) throw e
    await fetchWithAuth(
      `${BASE}/${spreadsheetId}/values:batchUpdate?valueInputOption=USER_ENTERED`,
      { method: "POST", body: JSON.stringify({ data }) },
    )
  }
}
