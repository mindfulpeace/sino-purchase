import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { queueLen, CHANGE_EVENT } from "./sync-queue"
import { processQueue } from "./db"
import type { SyncStatus } from "./types"

interface SyncContextValue {
  status: SyncStatus
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

  const process = useCallback(async () => {
    try { await processQueue() } catch { /* ignore */ }
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
    window.addEventListener(CHANGE_EVENT, handler)
    window.addEventListener("online", process)
    window.addEventListener("offline", handler)
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler)
      window.removeEventListener("online", process)
      window.removeEventListener("offline", handler)
    }
  }, [process])

  return (
    <SyncContext.Provider value={{ status, retry }}>
      {children}
    </SyncContext.Provider>
  )
}
