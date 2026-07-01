import type { ReactNode } from "react"

/** 导航标签项（左侧 edge） */
export interface NavigationItem {
  id: string
  icon: ReactNode
  label: string
  content: ReactNode
}

/** 业务标签（中部编辑器区） */
export interface EditorTab {
  id: string
  label: string
  content: ReactNode
  /** 该业务页关联的右侧面板配置 */
  rightPanels?: RightPanelConfig[]
}

/** 右侧面板定义 */
export interface RightPanelConfig {
  /** 面板唯一 id */
  id: string
  /** 面板标签标题 */
  label: string
  /** 面板内容 */
  content: ReactNode
}

/** Edge group 尺寸配置 */
export interface EdgeGroupConfig {
  size?: number
  minSize?: number
  maxSize?: number
}

/** DockLayout 主组件 Props */
export interface DockLayoutProps {
  /** 左侧导航标签列表 */
  navigation: NavigationItem[]
  /** 业务标签列表 */
  editors?: EditorTab[]
  /** 底部面板内容 */
  bottom?: ReactNode
  /** 左侧 edge 配置 */
  left?: EdgeGroupConfig
  /** 右侧 edge 配置 */
  right?: EdgeGroupConfig
  /** 底部 edge 配置 */
  bottomEdge?: EdgeGroupConfig
  /** 默认主题 */
  defaultTheme?: "dark" | "light"
  /** 右侧面板默认可见 (默认 true) */
  rightDefault?: boolean
  /** 底部面板默认可见 */
  bottomDefault?: boolean
  /** 右侧可见性（受控） */
  rightVisible?: boolean
  /** 右侧可见性变化回调 */
  onRightVisibleChange?: (v: boolean) => void
  /** dockview 就绪回调 */
  onReady?: (api: import("dockview").DockviewApi) => void
}
