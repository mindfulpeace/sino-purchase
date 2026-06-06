import { getConfig } from "./config"
import { clearToken, requestToken } from "./auth"
import type { SyncOp } from "./types"
import { queueLen, loadQueue, saveRemaining } from "./sync-queue"

const BASE = "https://sheets.googleapis.com/v4/spreadsheets"

export async function processQueue(): Promise<void> {
  const len = queueLen()
  if (len === 0) return
  const q = loadQueue()
  if (q.length === 0) return
  const remaining: SyncOp[] = []
  for (const op of q) {
    try {
      if (op.op === "insert" && op.data) {
        await insertRow(op.sheet, op.data)
      } else if (op.op === "update" && op.rowIndex && op.data && op.headers) {
        await updateRow(op.sheet, op.rowIndex, op.data, op.headers)
      } else if (op.op === "delete" && op.rowIndex) {
        await deleteRow(op.sheet, op.rowIndex)
      }
    } catch {
      remaining.push(op)
    }
  }
  saveRemaining(remaining)
}

async function fetchWithAuth<T = unknown>(url: string, opts: RequestInit = {}): Promise<T> {
  let token = await requestToken()
  let res = await fetch(url, {
    ...opts,
    headers: { ...opts.headers, Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    token = await requestToken()
    if (!token) { clearToken(); throw new Error("unauthorized") }
    res = await fetch(url, {
      ...opts,
      headers: { ...opts.headers, Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { clearToken(); throw new Error("unauthorized") }
  }
  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`)
  return res.json()
}

const sheetIdCache = new Map<string, number>()

async function refreshSheetCache(): Promise<void> {
  const { spreadsheetId } = getConfig()
  const info = await fetchWithAuth<{ sheets?: Array<{ properties: { title: string; sheetId: number } }> }>(
    `${BASE}/${spreadsheetId}`
  )
  for (const s of info.sheets || []) {
    sheetIdCache.set(s.properties.title, s.properties.sheetId)
  }
}

async function getSheetId(name: string): Promise<number> {
  if (!sheetIdCache.has(name)) await refreshSheetCache()
  return sheetIdCache.get(name) ?? 0
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
  await refreshSheetCache()
  if (sheetIdCache.has(sheetName)) return
  await fetchWithAuth(`${BASE}/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: sheetName } } }] }),
  })
  await refreshSheetCache()
  if (headers.length > 0) {
    await fetchWithAuth(
      `${BASE}/${spreadsheetId}/values/${sheetName}!A1:${rowKey(headers.length - 1)}1?valueInputOption=USER_ENTERED`,
      { method: "PUT", body: JSON.stringify({ values: [headers] }) },
    )
  }
}

export async function listSheets(): Promise<string[]> {
  await refreshSheetCache()
  return Array.from(sheetIdCache.keys())
}

export async function findRow(sheetName: string, uuid: string): Promise<number | null> {
  const { spreadsheetId } = getConfig()
  const res = await fetchWithAuth<{ values?: string[][] }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!A:A`
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
    `${BASE}/${spreadsheetId}/values/${sheetName}!1:10000`
  )
  const rows: string[][] = res.values || []
  if (rows.length < 2) return { data: [], rowMap: new Map() }

  const rowHeaders = rows[0]
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

  return { data, rowMap }
}

export async function insertRow(sheetName: string, values: Record<string, unknown>): Promise<void> {
  const { spreadsheetId } = getConfig()
  const res = await fetchWithAuth<{ values?: string[][] }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!1:1`
  )
  const headers: string[] = (res.values?.[0]) || []
  if (headers.length === 0) return
  const row = headers.map(h => {
    const v = values[h]
    return v === undefined || v === null ? "" : String(v)
  })
  await fetchWithAuth(
    `${BASE}/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`,
    { method: "POST", body: JSON.stringify({ values: [row] }) },
  )
}

export async function updateRow(
  sheetName: string,
  rowIndex: number,
  values: Record<string, unknown>,
  _headers: string[],
): Promise<void> {
  const { spreadsheetId } = getConfig()
  const res = await fetchWithAuth<{ values?: string[][] }>(
    `${BASE}/${spreadsheetId}/values/${sheetName}!1:1`
  )
  const headers: string[] = (res.values?.[0]) || _headers
  const col = rowKey(headers.length - 1)
  const row = headers.map(h => {
    const v = values[h]
    return v === undefined || v === null ? "" : String(v)
  })
  await fetchWithAuth(
    `${BASE}/${spreadsheetId}/values/${sheetName}!A${rowIndex}:${col}${rowIndex}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values: [row] }) },
  )
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
