import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"

export interface FeedbackMessage {
  id: number
  text: string
  level: "info" | "warn" | "error"
}

export interface PropertiesFeedbackContextValue {
  messages: FeedbackMessage[]
  log: (text: string, level?: "info" | "warn" | "error") => void
  clear: () => void
}

const PropertiesFeedbackContext = createContext<PropertiesFeedbackContextValue | null>(null)

export function PropertiesFeedbackProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])
  const idRef = useRef(0)

  const log = useCallback((text: string, level: "info" | "warn" | "error" = "info") => {
    const id = ++idRef.current
    setMessages(prev => [...prev.slice(-99), { id, text, level }])
  }, [])

  const clear = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <PropertiesFeedbackContext.Provider value={{ messages, log, clear }}>
      {children}
    </PropertiesFeedbackContext.Provider>
  )
}

export function usePropertiesFeedback(): PropertiesFeedbackContextValue {
  const ctx = useContext(PropertiesFeedbackContext)
  if (!ctx) throw new Error("usePropertiesFeedback must be used within a PropertiesFeedbackProvider")
  return ctx
}
