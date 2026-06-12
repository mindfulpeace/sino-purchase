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
  /** 标签页底部工具栏（左侧固定） */
  bottomToolbar?: () => ReactNode
  /** 标签页状态栏信息，显示在 App 状态栏右侧 */
  statusInfo?: () => ReactNode
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
