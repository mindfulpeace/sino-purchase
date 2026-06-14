# @sino-purchase/ui-dock — Research & Plan

## Dockview 调研笔记

### 版本
- `dockview-react` v6.6.1 (2026-05)
- npm: `npm install dockview-react`
- CSS: `@import 'dockview-react/dist/styles/dockview.css'`

### 核心概念

| 概念 | 说明 |
|------|------|
| **Panel** | 内容单元，按 `id` + `component` 名注册。通过 `api.addPanel()` 创建 |
| **Group** | Panel 容器，带 tab 栏。多 Panel 在同一 Group 中显示为 Tab |
| **Edge Group** | 钉在四边的 Group (`left`/`right`/`top`/`bottom`)，可折叠/展开，支持全部 Panel API |
| **DockviewReact** | React 组件，接收 `components`、`onReady`、`theme` props |

### Edge Group API (关键)

```tsx
api.addEdgeGroup('left', { id: 'left-group', initialSize: 220, minimumSize: 150 })
api.addEdgeGroup('right', { id: 'right-group', initialSize: 300 })
api.addEdgeGroup('bottom', { id: 'bottom-group', initialSize: 200 })

api.addPanel({
  id: 'explorer',
  component: 'Explorer',
  title: 'Explorer',
  position: { referenceGroup: api.getEdgeGroup('left')!.id },
})

api.setEdgeGroupVisible('left', true)
api.isEdgeGroupVisible('left')

groupApi.collapse()
groupApi.expand()
groupApi.isCollapsed()
```

- Edge group 不能浮动/弹出窗口，是结构性元素
- 点击 active tab 切换折叠/展开
- 移除所有 panels 自动折叠
- 状态被 `toJSON` / `fromJSON` 包含

### Tab 系统 (内置)

dockview 自带完整 tab 系统，不需要自己写 tabReducer：
- 多 Panel 在同一 Group 中自动显示为 Tab
- 内置拖拽排序、关闭、上下文菜单
- 标题: `api.addPanel({ title: "My Tab" })`
- 自定义 Tab 渲染: `tabComponent: 'myTab'`
- 隐藏 tab 头: `panel.group.header.hidden = true`

### 主题系统

- 内置 13+ 主题: dark, light, abyss, dracula, vs, nord, catppuccin, monokai, solarized, github 等
- 应用: `className="dockview-theme-dark"` 或 `theme={themeObject}`
- CSS 变量: `--dv-tabs-and-actions-container-height`, `--dv-background-color` 等 20+
- 自定义主题: `DockviewTheme { name, className, colorScheme?, ... }`

### 事件

```tsx
api.onDidLayoutChange(() => {})
api.onDidActivePanelChange(panel => {})
api.onDidAddPanel(panel => {})
api.onDidRemovePanel(panel => {})
api.onWillDrop(event => { event.preventDefault() })
api.onDidActiveGroupChange(group => {})
```

### Panel API (激活/参数)

```ts
existing.api.setActive()   // 激活一个已存在的 panel（替代 API 文档中不存在的 setActivePanel）
existing.api.setVisible(true)  // 确保可见
panel.api.updateParameters({ key: 'value' })  // 更新参数，组件通过 props.api.getParameters() 读取
panel.api.close()           // 关闭 panel
```

注意: `DockviewApi` 没有 `setActivePanel` 方法（当前 v6.6 版本）。用 `panel.api.setActive()` 代替。

### CSS 类型声明

在库项目中，CSS import 需要 `vite-env.d.ts`:
```ts
declare module "*.css" {
  const content: string
  export default content
}
```

### 序列化

```tsx
const state = api.toJSON()
api.fromJSON(state)
api.clear()
api.fromJSON(layout, { reuseExistingPanels: true })
```

### 锁定

```tsx
panel.group.locked = true
panel.group.locked = 'no-drop-target'
<DockviewReact disableDnd={true} />
```

### Panel 注册

```tsx
const components = {
  myPanel: (props: IDockviewPanelProps) => {
    return <div>Hello {props.params?.title}</div>
  },
}

<DockviewReact components={components} onReady={...} />
```

### Panel 定位 (Position)

```tsx
// 相对 container
api.addPanel({ id: 'p2', component: 'default', position: { direction: 'right' } })

// 相对另一个 panel
api.addPanel({ id: 'p3', component: 'default', position: { referencePanel: 'p1', direction: 'below' } })

// 相对 group
api.addPanel({ id: 'p4', component: 'default', position: { referenceGroup: groupId, direction: 'left' } })

// 在 group 内指定 tab 位置
api.addPanel({ id: 'p5', component: 'default', position: { referenceGroup: groupId, index: 2 } })
```

### Hidden Header

```tsx
panel.group.header.hidden = true
```

---

## 布局设计方案

### 架构

```
┌───────────────────────────────────────────────────────┐
│  TitleBar (26px)                                       │
├──────┬────────────────────────────────────────────────┤
│ Act. │  DockviewArea                                    │
│ Bar  │  ┌──────────┬──────────────┬──────────────┐    │
│ 48px │  │ Left Edge│ Editor Grid  │ Right Edge    │    │
│      │  │ (Sidebar)│  (Tabs)      │ (Properties)  │    │
│      │  │          │              │               │    │
│      │  │          ├──────────────┤               │    │
│      │  │          │ Bottom Edge  │               │    │
│      │  │          │ (Panel)      │               │    │
│      └──┴──────────┴──────────────┴───────────────┘    │
├──────┴────────────────────────────────────────────────┤
│  StatusBar (22px)                                      │
└───────────────────────────────────────────────────────┘
```

**决策: ActivityBar 在 dockview 外部** — 因为 dockview 每边只支持一个 edge group，无法同时容纳 ActivityBar (48px 固定) + SiderBar (可变宽度)。

### API 设计

```tsx
interface DockviewLayoutProps {
  title?: ReactNode
  activities: Activity[]
  activityBarFooter?: ReactNode
  sidePanels: Record<string, SidePanel>
  tabs: EditorTab[]
  propertiesPanel?: (activeTabId: string | null) => PropertiesPanel | undefined
  propertiesVisible?: boolean
  onPropertiesVisibleChange?: (v: boolean) => void
  panelVisible?: boolean
  onPanelVisibleChange?: (v: boolean) => void
}
```

Types 复用 desk-ui 的 `Activity`, `EditorTab`, `SidePanel`, `PropertiesPanel`。

### 文件清单

| # | 文件 | 预计行数 |
|---|------|---------|
| 1 | `package.json` | 40 |
| 2 | `tsconfig.json` | 15 |
| 3 | `vite.config.ts` | 35 |
| 4 | `src/types.ts` | 30 |
| 5 | `src/styles/overrides.css` | 60 |
| 6 | `src/hooks/useDockviewApi.ts` | 30 |
| 7 | `src/hooks/useTabs.ts` | 40 |
| 8 | `src/DockviewLayout.tsx` | 250 |
| 9 | `src/index.ts` | 15 |

### 与 monorepo 协调

| 维度 | 注意事项 |
|------|---------|
| peer deps | `{ "dockview-react": "^6.6", "react": "^19" }` — 主应用装 dockview-react |
| 构建 | `npm run build:dockview`，主应用构建前先 build 此包 |
| 命名 | `@sino-purchase/ui-dock` 和 `@sino-purchase/desk-ui` 可以并存 |
| 主应用引用 | `apps/sino-purchase-v2/package.json` 加 workspace dep |
| CSS | 消费者需 import `dockview/dist/styles/dockview.css` + `@sino-purchase/ui-dock/style.css` |
