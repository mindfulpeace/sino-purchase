# @sino-purchase/ui — AI Context

## 概要
VS Code 风格 IDE 布局系统的 React 库（React 19 + Blueprint 6）。

## 安装
```bash
npm install @sino-purchase/ui
```
Peer deps: `react`, `react-dom`, `@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/table`, `react-router-dom`.

## 导入
```tsx
import { AppLayout, ThemeProvider } from "@sino-purchase/ui"
import "@sino-purchase/ui/style.css"

// 消费者还需导入 BP6 CSS：
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import "@blueprintjs/table/lib/css/table.css"
```

## 布局层级 + CSS 类名

```
┌─────────────────────────────────────────────┐
│  TitleBar (.hdr)              height: 26px  │
├────┬──────────┬──────────────┬──────────────┤
│    │          │              │              │
│  Nav  Menu    │  Editor      │  Properties  │
│ (.nav)(.menu) │  (.editor)   │  (.right)    │
│ 48px          │              │              │
│    │          │              │              │
├────┴──────────┴──────────────┴──────────────┤
│  Panel (.panel)                 height: 200 │
├─────────────────────────────────────────────┤
│  StatusBar (.status)           height: 22px │
└─────────────────────────────────────────────┘
```

根 div 类名: `bp6-dark`（暗色）或 `bp6-light`（亮色）。

## 架构
- `ThemeProvider` → `ThemeContext` 提供 `theme` / `toggleTheme`，自动在 `<html>` 上切换 `.bp6-theme-light` 类
- `AppLayout` 组装所有布局组件，内部嵌套 `PortalProvider > OverlaysProvider > HotkeysProvider`
- `PortalProvider` 包裹内部，Portal 容器自动加 `bp6-dark`（暗色模式）
- CSS 变量定义在 `:root` / `:root.bp6-theme-light`（Portal 组件通过 `var()` 可访问）
- 暗色模式: 根 `bp6-dark` + Portal 容器 `bp6-dark`
- 亮色模式: `<html>` 加 `.bp6-theme-light`

## 使用示例
```tsx
function App() {
  return (
    <ThemeProvider>
      <AppLayout
        title="My App"
        activities={[
          { id: "files", icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />, label: "Explorer" },
        ]}
        sidePanels={{
          files: { id: "files", label: "EXPLORER", render: ({ openTab }) => <FileTree onOpen={openTab} /> },
        }}
        tabs={[
          { id: "readme", label: "README.md", render: () => <div>content</div> },
        ]}
        propertiesPanel={(activeId) =>
          activeId === "readme"
            ? { id: "prop", label: "属性", render: () => <div>Properties</div> }
            : undefined
        }
      />
    </ThemeProvider>
  )
}
```

## 类型定义 (`types.ts`)
- `Activity` — `{ id: string, icon: ReactNode, label: string }`
- `EditorTab` — `{ id: string, label: string, render: () => ReactNode }`
- `SidePanel` — `{ id: string, label: string, render: (callbacks: { openTab: (id: string) => void }) => ReactNode }`
- `PropertiesPanel` — `{ id: string, label: string, render: () => ReactNode }`

## 要点 / 陷阱
- 蓝图画标用 `<Icon icon={IconNames.XXX} />`，从 `@blueprintjs/icons` 导入
- 构建顺序：先 build `@sino-purchase/ui`，再 build 消费者
- CSS 不内联注入，需手动 `import "@sino-purchase/ui/style.css"`
- 开发者模式下需 `optimizeDeps: { exclude: ["@sino-purchase/ui"] }`（npm link/workspace 场景）
- `useTabs` hook 从库导出，用 `useSearchParams` 做 URL 持久化
- `useSidebarResize` / `useRightResize` hook 分别处理左右侧栏拖拽缩放
- 所有颜色覆盖集中在 `blueprintOverrides.css`，BP6 Portal 组件用 `.bp6-dark .bp6-dialog` 选择器覆盖
- `OverlayToaster.create()` 返回 `Promise<Toaster>`，需 `useRef` + `useEffect`
- `Tab` 用 `panel` 属性代替 `TabPanel`
- `Breadcrumbs` 从 `@blueprintjs/core/lib/esm/components/breadcrumbs/breadcrumbs` 导入（BP6.15 顶部 re-export 缺失）
- `CompoundTag` 左侧内容用 `leftContent` prop，右侧用 `children`
- `ButtonVariant = { MINIMAL: "minimal", OUTLINED: "outlined", SOLID: "solid" }`
