import type { ReactNode } from "react"

export interface Activity {
  id: string
  icon: ReactNode
  label: string
}

export interface EditorTab {
  id: string
  label: string
  render: () => ReactNode
}

export interface SidePanel {
  id: string
  label: string
  render: (callbacks: { openTab: (id: string) => void }) => ReactNode
}

export interface PropertiesPanel {
  id: string
  label: string
  render: () => ReactNode
}
