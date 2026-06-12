# 从头构建 @sino-purchase/desk-ui 提示词集

## Prompt 1: 项目配置

**产出**: `package.json`, `tsconfig.json`, `vite.config.ts`

```
创建 @sino-purchase/desk-ui 包，React 19 + Blueprint 6 的 IDE 布局库。

package.json:
- name: "@sino-purchase/desk-ui", version "0.0.1"
- type: "module", ESM only
- main + module: "./dist/index.js", types: "./dist/index.d.ts"
- exports: { ".": { import, types }, "./style.css": "./dist/index.css" }
- peerDeps: react ^19, react-dom ^19, @blueprintjs/core ^6.15, @blueprintjs/icons ^6.10, @blueprintjs/table ^6.1, react-router-dom ^7
- devDeps: vite ^8, @vitejs/plugin-react ^6, vite-plugin-dts ^5, typescript ~6, vitest ^3, jsdom, testing-library 全家桶
- scripts: build → vite build, dev → vite build --watch

tsconfig.json:
- target es2023, module esnext, moduleResolution bundler
- jsx react-jsx, strict true, noUnusedLocals true, noUnusedParameters true
- declaration true, declarationMap true
- include ["src"]

vite.config.ts:
- plugins: [react(), dts({ tsconfigPath, beforeWriteFile: strip /src/ from output path })]
- build.lib: entry src/index.ts, formats ["es"], fileName "index"
- rollupOptions.external: react, react-dom, react/jsx-runtime, @blueprintjs/core, @blueprintjs/icons, @blueprintjs/table, react-router-dom
- test: environment jsdom, globals true, setupFiles ./src/test-setup.ts
```

---

## Prompt 2: 类型定义

**产出**: `src/types.ts`

```
导出 4 个核心类型，都是基于 ReactNode 的接口：

interface Activity {
  id: string
  icon: ReactNode     // 导航栏图标（用 <Icon> 渲染）
  label: string       // hover tooltip 文字
}

interface EditorTab {
  id: string
  label: string       // 标签页标题
  render: () => ReactNode   // 标签页内容
  bottomToolbar?: () => ReactNode   // 标签页底部固定工具栏（如选中操作栏），返回 null 时不渲染
  statusInfo?: () => ReactNode      // 状态栏右侧信息
}

interface SidePanel {
  id: string
  label: string       // 面板标题（大写字母）
  render: (callbacks: { openTab: (id: string) => void }) => ReactNode  // 面板内容，可打开标签页
}

interface PropertiesPanel {
  id: string
  label: string       // 属性栏标题
  render: () => ReactNode   // 属性栏内容
}
```

---

## Prompt 3: 主题系统

**产出**: `src/theme/themes.css`, `src/theme/ThemeContext.tsx`

### themes.css
:root 定义暗色主题 CSS 变量，:root.bp6-theme-light 定义亮色覆盖。
变量分两类：
1. 布局颜色：--bg-surface, --bg-elevated, --bg-raised, --bg-hover, --border, --text, --text-dim, --text-bright, --accent
2. 组件颜色：--sidebar-bg, --activitybar-bg, --titlebar-bg, --statusbar-bg, --panel-bg, --tab-active-bg, --tab-inactive-bg, --scrollbar-thumb 等
3. BP6 覆盖：--bp-intent-default-rest, --bp-typography-color-default-rest, --bp-surface-background-color-default-rest 等

配色参考 VS Code 暗色/亮色主题。变量放在 :root 上确保 Portal 组件（Dialog/Drawer）也能通过 var() 访问。

### ThemeContext.tsx
- ThemeProvider: 用 useState 管理 "dark" | "light"，toggle 切换
- useEffect: 在 <html> 上 toggle "bp6-theme-light" class
- 导出 useTheme() hook，返回 { theme, toggle }
- 不在 Provider 内使用时 throw Error
- 测试覆盖：默认 dark、toggle 切换、class 正确添加/移除、Provider 外 throw

---

## Prompt 4: 布局层级

**产出**: `src/layout/AppLayout.tsx`

```
AppLayout 是核心容器组件，内部嵌套 BP6 顺序：
PortalProvider > OverlaysProvider > HotkeysProvider > .app-root

Props:
- title: ReactNode（标题栏居中文字）
- activities: Activity[]（导航栏图标列表）
- activityBarFooter?: ReactNode（导航栏底部区域，放登录按钮等）
- sidePanels: Record<string, SidePanel>（活动ID → 侧栏面板）
- tabs: EditorTab[]（所有标签页）
- propertiesPanel?: (activeTabId) => PropertiesPanel | undefined（按活动ID返回属性栏配置）
- propertiesMinWidth?: number（属性栏最小宽度）
- propertiesVisible?: boolean, onPropertiesVisibleChange?: fn（受控显隐）
- hideStatusBar?: boolean（隐藏底部状态栏）

内部状态：
- showPanel: boolean（底部面板显隐）
- showMenu: boolean（默认为 true，菜单栏显隐）
- showPropertiesInternal: boolean（非受控模式的属性栏显隐）
- isControlled: propertiesVisible !== undefined
- showProperties = isControlled ? propertiesVisible : showPropertiesInternal

生命周期：
- 使用 useTabs hook（URL 持久化），tabIds = tabs.map(t => t.id)
- activeActivity 初始值：URL nav param → activities[0]?.id
- currentProperties = propertiesPanel(activeId)（useMemo）

事件处理：
- handleActivityChange(id): 切换活动，如果 tabIds 包含该 id 则自动打开标签页并显示属性栏
- openTab(id): 打开标签页 + 显示属性栏 + URL 同步
- closeTab(id): 关闭标签页 + 激活相邻标签 + URL 同步

布局结构：
.app-root (bp6-dark / bp6-light)
  PropertiesFeedbackProvider
    TitleBar (rightContent = 三个切换按钮)
    .app-body
      ActivityBar (footer = activityBarFooter)
      {showMenu && SiderBar}
      EditorArea
      {showProperties && currentProperties && PropertiesBar}
    Panel (show=showPanel)
    {!hideStatusBar && StatusBar}

三个标题栏切换按钮（内置于 AppLayout，不需要外部传入）：
- 菜单栏：toggle showMenu，图标 IconNames.MENU
- 属性栏：toggle showProperties，图标 IconNames.SETTINGS
- 底部面板：toggle showPanel，图标 IconNames.CHEVRON_UP / CHEVRON_DOWN
```

---

## Prompt 5: 子组件

**产出**: 所有 `src/layout/*.tsx`（除 AppLayout）

### TitleBar.tsx
- Props: children?: ReactNode, rightContent?: ReactNode
- .hdr 容器 → .hdr-text（children）+ .hdr-right（rightContent）

### ActivityBar.tsx
- Props: activities, activeActivity, onActivityChange, footer?
- .nav 容器 → 每个 activity 一个 .nav-item（active 类 +::before 指示器） → flex:1 空白 → footer → 主题切换按钮（月亮/闪电图标）

### SiderBar.tsx
- Props: panel?: SidePanel, onOpenTab
- 使用 useSidebarResize hook 实现拖拽缩放
- .menu → .menu-header（panel.label）+ .menu-content（panel.render）+ .menu-resize 拖拽手柄
- panel 为空返回 null

### EditorArea.tsx
- Props: openIds, activeId, tabs, onTabChange, onTabClose
- openIds 为空时显示 welcome 页（CODE 图标 + 提示文字）
- .editor → .editor-tabs（每个 tab 一个 .editor-tab，active 高亮 + x 关闭按钮）→ .editor-content（只显示 active tab 内容+可选的 bottomToolbar）
- bottomToolbar 返回 null 时不渲染外层 div

### PropertiesBar.tsx
- Props: panel?, onClose, minWidth?
- 使用 useRightResize hook 实现拖拽缩放
- .right → .right-header（panel.label + ×关闭按钮） → .right-content（panel.render()） → FeedbackDisplay（从 context 读取反馈消息） → .right-resize 拖拽手柄
- FeedbackDisplay: 读取 usePropertiesFeedback()，显示消息列表 + 清除按钮

### Panel.tsx
- Props: show, height, onClose
- show=false 返回 null
- .panel → .panel-header（"Terminal" + ×） → .panel-content（placeholder）

### StatusBar.tsx
- Props: showPanel, onPanelToggle, showProperties, onPropertiesToggle, statusInfo?
- .status → .status-left（面板切换 + 属性切换） → .status-right（statusInfo + 面板文字）

---

## Prompt 6: Hooks

**产出**: `src/hooks/useSidebarResize.ts`, `useTabs.ts`, `usePropertiesFeedback.tsx`

### useSidebarResize.ts
两个 hook：
- useSidebarResize(initialWidth=200, minWidth=120, maxWidth=600)
  返回 { sidebarWidth, handleSidebarResizeStart }
  拖拽时：newWidth = clamp(minWidth, maxWidth, startWidth + clientX - initialX)
- useRightResize(initialWidth=435, minWidth=435, maxWidth=800)
  返回 { width, handleResizeStart }
  拖拽时：newWidth = clamp(minWidth, maxWidth, startWidth - (clientX - initialX))
  拖拽逻辑：mousedown → document mousemove/mouseup 监听 → 移除

### useTabs.ts
- 使用 useSearchParams（react-router-dom）做 URL 持久化
- useReducer + tabReducer，三个 action：
  - open: 添加 id 到 openIds（不重复），设 activeId
  - close: 移除 id，若 activeId 被关则激活相邻 tab
  - activate: 设 activeId（忽略未知 id）
- 初始状态从 URL param "tabs"（逗号分隔）和 "tab"（activeId）恢复
- sync(ids, nav, activeId) 函数：写 URL 的 tabs/nav/tab params，replace: true
- 返回 { openIds, activeId, dispatch, sync, initialNavId }
- initialNavId 从 URL param "nav" 读取（仅初始，不响应后续变化）

### usePropertiesFeedback.tsx
- PropertiesFeedbackContext + PropertiesFeedbackProvider
- 状态：messages: FeedbackMessage[]（{id, text, level}），idRef 自增
- log(text, level="info" | "warn" | "error")：追加消息，保留最近 100 条
- clear()：清空
- usePropertiesFeedback() hook：读取 context，不在 Provider 内时 throw Error
- Provider 放在 AppLayout 的 .app-root 内层，确保编辑区和属性栏都可访问

---

## Prompt 7: CSS

**产出**: `src/layout/AppLayout.css`, `blueprintOverrides.css`

### AppLayout.css
```
.app-root.bp6-dark/.bp6-light: flex column, height 100vh, CSS 变量颜色

标题栏 .hdr: 26px, flex center, --titlebar-bg
.hdr-text: opacity 0.7
.hdr-right: margin-left auto, flex center
.hdr-toggles: flex
.hdr-toggle: 26x26, transparent, --text-dim, opacity 0.6, hover 提升

主体 .app-body: flex:1, flex row, overflow hidden

导航栏 .nav: 48px wide, flex column, --activitybar-bg
.nav-item: 48x48, hover/active 效果, active::before 左侧 2px 指示线

菜单栏 .menu: flex column, --sidebar-bg, 可拖拽缩放
.menu-header: 35px, uppercase, --text-bright
.menu-content: flex:1, overflow auto, 内容 text-overflow ellipsis
.menu-resize: absolute right -3px, 6px wide, col-resize cursor

属性栏 .right: flex column, --sidebar-bg, 可拖拽缩放
.right-header: 35px, uppercase, space-between
.right-content: flex:1, overflow auto
.right-resize: absolute left -3px, 6px wide, col-resize cursor
.right-feedback: border-top, max-height 80px, flex-shrink 0, 消息列表+清除按钮
.right-feedback-msg: 11px, 不同 level 颜色

编辑区 .editor: flex:1, flex column
.editor-tabs: flex row, --tab-inactive-bg, overflow-x auto
.editor-tab: 35px, 带 right border, active 时 --tab-active-bg + bottom border 覆盖
.editor-content: flex:1, overflow hidden, --bg-surface

底部面板 .panel: flex column, --panel-bg
.panel-header: 28px, uppercase
.panel-content: monospace 13px

状态栏 .status: 22px, --statusbar-bg, white text, flex row space-between
.status-item: hover 背景

文件树 .file-tree: list-style none, 缩进 16px
.file-item: 13px, ellipsis

滚动条自定义：.menu-content / .right-content / .panel-content 专用

CSV Editor 样式：.csv-editor-toolbar / .csv-editor-body / .csv-editor-panel
```

### blueprintOverrides.css
```
- 移除所有 button:focus outline
- BP6 表格暗色/亮色背景
- Dialog/Drawer Portal 颜色覆盖（.bp6-dark .bp6-dialog 选择器）
```

---

## Prompt 8: 桶文件导出

**产出**: `src/index.ts`

```
// 按此顺序自动导入 CSS（构建后合并到 dist/index.css）
import "./layout/AppLayout.css"
import "./layout/blueprintOverrides.css"
import "./theme/themes.css"

// 类型导出
export type { Activity, EditorTab, SidePanel, PropertiesPanel } from "./types"

// 组件导出
export { ThemeProvider, useTheme } from "./theme/ThemeContext"
export { TitleBar } from "./layout/TitleBar"
export { ActivityBar } from "./layout/ActivityBar"
export { SiderBar } from "./layout/SiderBar"
export { PropertiesBar } from "./layout/PropertiesBar"
export { EditorArea } from "./layout/EditorArea"
export { Panel } from "./layout/Panel"
export { StatusBar } from "./layout/StatusBar"
export { default as AppLayout } from "./layout/AppLayout"

// Hook 导出
export { useSidebarResize, useRightResize } from "./hooks/useSidebarResize"
export { useTabs } from "./hooks/useTabs"
export { usePropertiesFeedback } from "./hooks/usePropertiesFeedback"
```

---

## 组件树总览

```
AppLayout
├── TitleBar (hdr)
│   ├── .hdr-text (children)
│   └── .hdr-right (三个 toggle 按钮)
├── .app-body
│   ├── ActivityBar (nav)
│   │   ├── nav-items
│   │   ├── footer (登录按钮)
│   │   └── 主题切换
│   ├── SiderBar (menu) — showMenu 控制显隐
│   │   ├── menu-header
│   │   ├── menu-content (scroll)
│   │   └── menu-resize
│   ├── EditorArea (editor)
│   │   ├── editor-tabs
│   │   ├── editor-content (scroll, active tab)
│   │   └── editor-bottom-toolbar (可选)
│   └── PropertiesBar (right) — showProperties 控制显隐
│       ├── right-header (label + ×)
│       ├── right-content (scroll)
│       ├── right-feedback (消息日志)
│       └── right-resize
├── Panel (panel) — showPanel 控制显隐
│   ├── panel-header
│   └── panel-content
└── StatusBar (status) — hideStatusBar 控制显隐
    ├── status-left
    └── status-right
```

## 关键设计决策

1. **Provider 嵌套顺序**: PortalProvider → OverlaysProvider → HotkeysProvider（BP6 推荐）
2. **暗色模式**: 根 .app-root 加 bp6-dark，PortalProvider 传 portalClassName="bp6-dark"
3. **亮色模式**: html 加 .bp6-theme-light 类，PortalProvider 不传 portalClassName
4. **颜色变量**: 定义在 :root 上，Portal 组件通过 var() 访问
5. **CSS 作用域**: 根 div 用 .app-root 类名限定，避免 portal 误匹配布局样式
6. **图标**: 从 @blueprintjs/icons 导入 IconNames，用 <Icon icon={IconNames.XXX} />
7. **Tab 状态**: useTabs hook（useReducer + useSearchParams），URL 持久化
8. **拖拽**: useSidebarResize 左栏（+clientX）/ useRightResize 右栏（-clientX）
9. **反馈机制**: PropertiesFeedbackProvider 在 AppLayout 级别，usePropertiesFeedback 可在任意子组件调用
10. **选中工具栏**: EditorTab.bottomToolbar 可选，返回 null 时不渲染
