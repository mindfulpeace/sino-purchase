import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"

interface PropertiesContextValue {
  register: (id: string, content: ReactNode) => () => void
  activeId: string | null
  setActiveId: (id: string | null) => void
  activeContent: ReactNode | null
}

const PropertiesContext = createContext<PropertiesContextValue | null>(null)

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const registryRef = useRef<Map<string, ReactNode>>(new Map())

  const register = useCallback((id: string, content: ReactNode) => {
    registryRef.current.set(id, content)
    return () => { registryRef.current.delete(id) }
  }, [])

  const activeContent = useMemo(() => {
    if (!activeId) return null
    return registryRef.current.get(activeId) ?? null
  }, [activeId])

  return (
    <PropertiesContext.Provider value={{ register, activeId, setActiveId, activeContent }}>
      {children}
    </PropertiesContext.Provider>
  )
}

export function usePropertiesContext(): PropertiesContextValue {
  const ctx = useContext(PropertiesContext)
  if (!ctx) throw new Error("usePropertiesContext must be used within PropertiesProvider")
  return ctx
}
