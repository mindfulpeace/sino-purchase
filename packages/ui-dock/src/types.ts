import type { ReactNode } from "react"

export interface NavigationItem {
  id: string
  icon: ReactNode
  label: string
  content: ReactNode
}

export interface EditorTab {
  id: string
  label: string
  content: ReactNode
}

export interface DeskDockviewLayoutProps {
  title?: ReactNode
  navigation: NavigationItem[]
  editors?: EditorTab[]
  properties?: ReactNode
  bottom?: ReactNode
}
