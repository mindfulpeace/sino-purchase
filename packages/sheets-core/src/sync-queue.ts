import type { SyncOp } from "./types"

export const CHANGE_EVENT = "sino-sync-change"

const QUEUE_KEY = "sino-sync-queue"

export function loadQueue(): SyncOp[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") }
  catch { return [] }
}

function saveQueue(q: SyncOp[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
}

const MAX_QUEUE = 1000

export function enqueue(op: SyncOp): void {
  const q = loadQueue()
  if (q.length >= MAX_QUEUE) {
    q.splice(0, q.length - MAX_QUEUE + 1)
  }
  q.push(op)
  saveQueue(q)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function queueLen(): number {
  return loadQueue().length
}

export function saveRemaining(q: SyncOp[]): void {
  saveQueue(q)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
