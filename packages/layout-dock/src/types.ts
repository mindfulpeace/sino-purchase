/**
 * @sino-purchase/layout-dock
 *
 * 基于 dockview 的「编辑器应用框架」布局库。
 * 提供 navigation（左侧导航）、editors（中部标签页）、rightPanels（每编辑器右侧面板）、
 * bottom（底部面板）等业务语义，以及持久化（persistenceKey）、主题切换能力。
 *
 * 面板 id 约定（DockLayout 内部使用，消费者一般无需关心）：
 *   nav-${id}      — 左侧导航面板
 *   editor-${id}   — 中部编辑器面板
 *   right-${id}    — 右侧属性面板（按编辑器切换）
 *   bottom-panel   — 底部面板
 *   left-edge / right-edge / bottom-edge — dockview edge group
 *
 * 注意：本包由 ui-dock 分叉演进，新增了持久化与 per-editor rightPanels；
 * ui-dock 已标记 deprecated，后续计划将两者合并至此包。
 */
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
  /** 受控主题：传入后由外部（如应用级 ThemeProvider）驱动，内部不再自管理 */
  theme?: "dark" | "light"
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
  /** 持久化 key；设置后刷新页面会恢复之前打开的编辑器、可见性与主题 */
  persistenceKey?: string
}
