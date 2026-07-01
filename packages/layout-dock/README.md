# @sino-purchase/layout-dock

基于 [dockview](https://dockview.dev) 的应用布局库，提供开箱即用的 VS Code 风格多面板 IDE 布局。

## 安装

### Peer Dependencies

确保项目中已安装以下依赖：

```bash
npm install react react-dom @blueprintjs/core @blueprintjs/icons dockview
```

### 安装 layout-dock

作为 monorepo 内部包，通过 npm workspace 引用：

```json
{
  "dependencies": {
    "@sino-purchase/layout-dock": "*"
  }
}
```

## 快速开始

```tsx
import { DockLayout } from "@sino-purchase/layout-dock"

function App() {
  return (
    <DockLayout
      defaultTheme="dark"
      navigation={[
        {
          id: "nav1",
          icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />,
          label: "模块1",
          content: <NavPanel />,
        },
      ]}
      editors={[
        {
          id: "editor1",
          label: "页面1",
          content: <EditorContent />,
          rightPanels: [
            {
              id: "info",
              label: "信息面板",
              content: <InfoPanel />,
            },
          ],
        },
      ]}
    />
  )
}
```

> **注意**：父容器必须有明确高度（`height: 100vh` 或 `height: 100%`），`DockLayout` 默认占满父容器。

## API 参考

### `<DockLayout>` Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `navigation` | `NavigationItem[]` | **必填** | 左侧导航标签列表 |
| `editors` | `EditorTab[]` | `undefined` | 中部编辑器标签列表 |
| `bottom` | `ReactNode` | `undefined` | 底部面板内容 |
| `left` | `EdgeGroupConfig` | `{ size: 200, minSize: 120, maxSize: 600 }` | 左侧面板尺寸 |
| `right` | `EdgeGroupConfig` | `{ size: 200, minSize: 150 }` | 右侧面板尺寸 |
| `bottomEdge` | `EdgeGroupConfig` | `{ size: 200, minSize: 60 }` | 底部面板尺寸 |
| `defaultTheme` | `"dark" \| "light"` | `"dark"` | 默认主题 |
| `rightDefault` | `boolean` | `true` | 右侧面板默认可见 |
| `bottomDefault` | `boolean` | `false` | 底部面板默认可见 |
| `rightVisible` | `boolean` | `undefined` | 右侧可见性（受控模式） |
| `onRightVisibleChange` | `(v: boolean) => void` | `undefined` | 右侧可见性变化回调 |
| `onReady` | `(api: DockviewApi) => void` | `undefined` | dockview 实例就绪回调 |

### `useDock()` Context API

在 `DockLayout` 内部的任何组件中调用 `useDock()` 获取布局控制能力：

```tsx
import { useDock } from "@sino-purchase/layout-dock"

function MyComponent() {
  const {
    openEditor,       // (id: string) => void
    closeEditor,      // (id: string) => void
    getApi,           // () => DockviewApi | null
    setLeftVisible,   // (v: boolean) => void
    setRightVisible,  // (v: boolean) => void
    setBottomVisible, // (v: boolean) => void
    leftVisible,      // boolean
    rightVisible,     // boolean
    bottomVisible,    // boolean
    theme,            // "dark" | "light"
    setTheme,         // (t: "dark" | "light") => void
  } = useDock()
  // ...
}
```

| 方法/属性 | 类型 | 说明 |
|---|---|---|
| `openEditor(id)` | `(id: string) => void` | 打开编辑器标签（已存在则激活） |
| `closeEditor(id)` | `(id: string) => void` | 关闭编辑器标签 |
| `getApi()` | `() => DockviewApi \| null` | 获取 dockview 原始 API 实例 |
| `setLeftVisible(v)` | `(v: boolean) => void` | 切换左侧面板可见性 |
| `setRightVisible(v)` | `(v: boolean) => void` | 切换右侧面板可见性 |
| `setBottomVisible(v)` | `(v: boolean) => void` | 切换底部面板可见性 |
| `leftVisible` | `boolean` | 左侧面板是否可见 |
| `rightVisible` | `boolean` | 右侧面板是否可见 |
| `bottomVisible` | `boolean` | 底部面板是否可见 |
| `theme` | `"dark" \| "light"` | 当前主题 |
| `setTheme(t)` | `(t: "dark" \| "light") => void` | 切换主题 |

### 内置组件

库同时导出以下便捷组件，用于构建面板内容：

```tsx
import { DockMenuItem, DockInput, DockPlaceholder, DockSection } from "@sino-purchase/layout-dock"
```

#### `DockMenuItem`

可点击的菜单项，带图标。

```tsx
<DockMenuItem icon={IconNames.DOCUMENT} label="打开详情" onClick={() => openEditor("detail")} />
```

| Props | 类型 | 说明 |
|---|---|---|
| `icon` | `IconName` | Blueprint 图标（可选） |
| `label` | `string` | 标签文字 |
| `onClick` | `() => void` | 点击回调（可选） |

#### `DockInput`

样式统一的文本输入框。

```tsx
<DockInput placeholder="搜索..." value={search} onChange={setSearch} />
```

| Props | 类型 | 说明 |
|---|---|---|
| `placeholder` | `string` | 占位文字（可选） |
| `value` | `string` | 输入值（可选） |
| `onChange` | `(v: string) => void` | 变化回调（可选） |

#### `DockPlaceholder`

居中占位符，适合空状态展示。

```tsx
<DockPlaceholder icon={IconNames.INBOX} title="暂无内容" />
```

| Props | 类型 | 说明 |
|---|---|---|
| `icon` | `IconName` | Blueprint 图标（可选） |
| `title` | `string` | 占位文字 |

#### `DockSection`

带标题的面板区块。

```tsx
<DockSection title="设置">
  <DockMenuItem icon={IconNames.COG} label="选项1" />
  <DockMenuItem icon={IconNames.KEY} label="选项2" />
</DockSection>
```

| Props | 类型 | 说明 |
|---|---|---|
| `title` | `string` | 区块标题 |
| `children` | `ReactNode` | 子内容（可选） |

### 导出类型

```tsx
import type {
  NavigationItem,
  EditorTab,
  DockLayoutProps,
  RightPanelConfig,
  EdgeGroupConfig,
  DockviewApi,
} from "@sino-purchase/layout-dock"
```

#### `NavigationItem`

```ts
interface NavigationItem {
  id: string       // 唯一标识
  icon: ReactNode  // 图标元素
  label: string    // 标签文字
  content: ReactNode // 面板内容（点击标签后展示在左侧）
}
```

#### `EditorTab`

```ts
interface EditorTab {
  id: string                    // 唯一标识（通过 openEditor(id) 打开）
  label: string                 // 标签标题
  content: ReactNode            // 编辑器内容
  rightPanels?: RightPanelConfig[] // 该页面关联的右侧面板
}
```

#### `RightPanelConfig`

```ts
interface RightPanelConfig {
  id: string       // 面板唯一 id
  label: string    // 面板标签标题
  content: ReactNode // 面板内容
}
```

> **右侧面板行为**：切换编辑器标签时，右侧面板自动替换为对应 `EditorTab.rightPanels` 中的面板。右侧面板的开闭状态在所有编辑器标签间保持一致。

#### `EdgeGroupConfig`

```ts
interface EdgeGroupConfig {
  size?: number    // 默认尺寸 (px)
  minSize?: number // 最小尺寸 (px)
  maxSize?: number // 最大尺寸 (px)
}
```

## CSS 工具类

库内置以下 CSS 类，导入后即可使用：

| 类名 | 用途 |
|---|---|
| `.dv-panel` | 带内边距的面板容器 (padding: 8px) |
| `.dv-panel-wide` | 宽面板容器 (padding: 12px) |
| `.dv-panel-item` | 可点击菜单项（icon + 文字，hover 高亮） |
| `.dv-panel-input` | 样式统一的文本输入框 |
| `.dv-panel h4` | 面板标题 (font-size: 13px, 底部间距: 8px) |
| `.dv-panel-footer` | 面板底部文字 (font-size: 12px) |
| `.dv-placeholder` | 居中空状态占位 |
| `.dv-bottom` | 底部面板容器 |
| `.dv-section-header` | 展示区标题 |
| `.dv-section-body` | 展示区内容 |

所有文案颜色、图标颜色、hover 背景色均使用 dockview 内置 CSS 变量，**自动适配明暗主题**，无需手动处理颜色。

## 完整示例

```tsx
import { useState } from "react"
import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { DockLayout, useDock, DockMenuItem, DockPlaceholder } from "@sino-purchase/layout-dock"

// ── 左侧导航面板 ──

function NavPanel() {
  const { openEditor } = useDock()
  return (
    <div className="dv-panel">
      <DockMenuItem icon={IconNames.DOCUMENT} label="页面1" onClick={() => openEditor("page1")} />
      <DockMenuItem icon={IconNames.CHART} label="页面2" onClick={() => openEditor("page2")} />
    </div>
  )
}

// ── 设置面板（含主题切换） ──

function SettingsNav() {
  const { theme, setTheme } = useDock()
  return (
    <div className="dv-panel">
      <h4>主题设置</h4>
      <DockMenuItem icon={IconNames.MOON} label="暗色模式" onClick={() => setTheme("dark")} />
      <DockMenuItem icon={IconNames.FLASH} label="亮色模式" onClick={() => setTheme("light")} />
      <span style={{ fontSize: 12 }}>当前: {theme}</span>
    </div>
  )
}

// ── 编辑器内容 ──

function Page1() {
  return <div className="dv-panel-wide"><h3>页面1</h3></div>
}

function Page2() {
  const [count, setCount] = useState(0)
  return (
    <div className="dv-panel-wide">
      <h3>页面2 — 计数器: {count}</h3>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  )
}

// ── 右侧面板 ──

function InfoPanel() {
  return (
    <div className="dv-panel">
      <h4>信息</h4>
      <p style={{ fontSize: 12 }}>当前选中的是页面1。</p>
    </div>
  )
}

function StatsPanel() {
  return (
    <div className="dv-panel">
      <h4>统计</h4>
      <DockPlaceholder icon={IconNames.CHART} title="暂无数据" />
    </div>
  )
}

// ── 组合 ──

export function App() {
  return (
    <DockLayout
      defaultTheme="dark"
      navigation={[
        {
          id: "main",
          icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />,
          label: "主菜单",
          content: <NavPanel />,
        },
        {
          id: "settings",
          icon: <Icon icon={IconNames.COG} size={20} />,
          label: "设置",
          content: <SettingsNav />,
        },
      ]}
      editors={[
        {
          id: "page1",
          label: "页面1",
          content: <Page1 />,
          rightPanels: [{ id: "info", label: "信息", content: <InfoPanel /> }],
        },
        {
          id: "page2",
          label: "页面2",
          content: <Page2 />,
          rightPanels: [{ id: "stats", label: "统计", content: <StatsPanel /> }],
        },
      ]}
      left={{ size: 220, minSize: 150 }}
      right={{ size: 250, minSize: 180 }}
    />
  )
}
```

## 与 @sino-purchase/ui-dock 的区别

| | `layout-dock` | `ui-dock` |
|---|---|---|
| 右侧面板 | 支持多个，按编辑器标签切换 | 单个固定 |
| 底部面板 | 可折叠 edge 面板 | 固定 |
| 状态栏 | 无内置 | 有 22px 状态栏 |
| 主题 | 直接切换 dockview 主题 | 通过 theme context |
| Dependency | 仅 dockview + BP | dockview + BP + desk-ui |
| API | `useDock()` 精简 context | `useDock()` 含 status/summary |

新项目请使用 `layout-dock`。`ui-dock` 为遗留库，仅维护不再新增功能。
