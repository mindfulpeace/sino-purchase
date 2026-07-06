import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { queueLen, CHANGE_EVENT, SYNC_ERROR_EVENT, processQueue } from "@sino-purchase/sheets-core"
import type { SyncStatus } from "@sino-purchase/sheets-core"

interface SyncContextValue {
  status: SyncStatus
  /** 最近一次因永久错误（如 4xx）被丢弃的写操作数量，归零表示队列健康 */
  failedCount: number
  retry: () => Promise<void>
}

const SyncContext = createContext<SyncContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useSync() {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error("useSync must be used within SyncProvider")
  return ctx
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>(() => queueLen() > 0 ? "syncing" : "synced")
  const [failedCount, setFailedCount] = useState(0)

  const process = useCallback(async () => {
    try {
      const r = await processQueue()
      setFailedCount(r.failed)
    } catch {
      /* ignore */
    }
    setStatus(queueLen() > 0 ? "unsynced" : "synced")
  }, [])

  const retry = useCallback(async () => {
    setStatus("syncing")
    await process()
  }, [process])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { process() }, [process])

  useEffect(() => {
    const handler = () => setStatus(queueLen() > 0 ? "unsynced" : "synced")
    const onSyncError = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail
      setFailedCount(prev => prev + (detail?.count ?? 0))
    }
    window.addEventListener(CHANGE_EVENT, handler)
    window.addEventListener(SYNC_ERROR_EVENT, onSyncError as EventListener)
    window.addEventListener("online", process)
    window.addEventListener("offline", handler)
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler)
      window.removeEventListener(SYNC_ERROR_EVENT, onSyncError as EventListener)
      window.removeEventListener("online", process)
      window.removeEventListener("offline", handler)
    }
  }, [process])

  return (
    <SyncContext.Provider value={{ status, failedCount, retry }}>
      {children}
    </SyncContext.Provider>
  )
}
