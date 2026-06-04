import { createContext, useContext, useMemo, type ReactNode } from "react"
import { configure } from "./config"
import type { SheetsConfig } from "./types"
import { SyncProvider } from "./useSync"

const ConfigContext = createContext<SheetsConfig | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useSheetsConfig(): SheetsConfig {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error("useSheetsConfig must be used within SheetsProvider")
  return ctx
}

export interface SheetsProviderProps extends SheetsConfig {
  children: ReactNode
}

export function SheetsProvider({ clientId, spreadsheetId, scope, children }: SheetsProviderProps) {
  const config = useMemo(() => ({ clientId, spreadsheetId, scope }), [clientId, spreadsheetId, scope])
  configure(config)

  return (
    <ConfigContext.Provider value={config}>
      <SyncProvider>
        {children}
      </SyncProvider>
    </ConfigContext.Provider>
  )
}
