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

export interface StatusBarProps {
  left?: ReactNode
  right?: ReactNode
}

export interface EdgeGroupConfig {
  size?: number
  minSize?: number
  maxSize?: number
  title?: string
}

export interface DockLayoutProps {
  title?: ReactNode
  headerRight?: ReactNode
  navigation: NavigationItem[]
  editors?: EditorTab[]
  properties?: ReactNode
  bottom?: ReactNode
  left?: EdgeGroupConfig
  right?: EdgeGroupConfig
  bottomEdge?: EdgeGroupConfig
  defaultTheme?: "dark" | "light"
  rightDefault?: boolean
  bottomDefault?: boolean
  rightVisible?: boolean
  onRightVisibleChange?: (v: boolean) => void
  statusBar?: boolean
  onReady?: (api: import("dockview").DockviewApi) => void
}
