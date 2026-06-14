import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"

export interface FeedbackMessage {
  id: number
  text: string
  level: "info" | "warn" | "error"
}

interface FeedbackContextValue {
  messages: FeedbackMessage[]
  log: (text: string, level?: "info" | "warn" | "error") => void
  clear: () => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function FeedbackProvider({ children }: { children: ReactNode }) {
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
    <FeedbackContext.Provider value={{ messages, log, clear }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function usePropertiesFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error("usePropertiesFeedback must be used within FeedbackProvider")
  return ctx
}
