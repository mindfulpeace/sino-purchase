import { createContext, useContext } from "react"
import type { DockviewApi } from "dockview"

export const DockviewApiContext = createContext<DockviewApi | null>(null)

export function useDockviewApi(): DockviewApi | null {
  return useContext(DockviewApiContext)
}
