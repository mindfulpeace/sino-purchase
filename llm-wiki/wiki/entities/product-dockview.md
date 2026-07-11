# Dockview 6.6（dockview-react）

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/lib-dockview-v66]]
> **版本**: dockview = 6.6.1（dockview-react）；本项目封装为 @sino-purchase/layout-dock

## 摘要
Dockview 是零依赖的 docking 布局库（VS Code 风格）。本项目用其封装 `@sino-purchase/layout-dock` 实现"标题栏/导航栏/编辑区/属性栏/底部面板/状态栏"六区框架。核心能力：edge group（四边可折叠栏）、内置 tab 系统、主题、序列化。

## 详情

### 安装与 CSS
```ts
import { DockviewReact } from 'dockview-react'
import 'dockview-react/dist/styles/dockview.css'
```

### Edge Group（关键 API）
```ts
api.addEdgeGroup('left', { id: 'left-group', initialSize: 220, minimumSize: 150, maximumSize: 600 })
api.setEdgeGroupVisible('left', true)
const g = api.getEdgeGroup('left')
g?.collapse(); g?.expand(); g?.isCollapsed()
```
- 每边仅一个 edge group；重复 `addEdgeGroup` 抛错
- 点击 active tab 切换折叠/展开；移除所有 panel 自动折叠
- 不能浮动/弹出窗口，是结构性元素

### 加 Panel 到 Edge Group
```ts
const leftApi = api.addEdgeGroup('left', { id: 'left-group', initialSize: 220 })
api.addPanel({ id: 'nav', component: 'Nav', title: '导航',
  position: { referenceGroup: leftApi.id } })
panel.group.locked = 'no-drop-target'   // 锁定防止拖走
panel.api.setActive()                    // 激活（v6.6 无 setActivePanel）
```

### 主题 & CSS 变量
- 内置：abyss / visualStudio / dark / light / dracula / nord / catppuccinMocha / githubDark 等
- React：`theme={themeAbyss}`
- 关键变量：`--dv-tabs-and-actions-container-height`、`--dv-background-color`、`--dv-paneview-active-outline-color`

### 序列化
```ts
const state = api.toJSON()
api.fromJSON(state)   // 自动按 state 重建 edge groups
```

### 本项目真实用法（layout-dock/DockLayout.tsx）
```tsx
const dvTheme = theme === 'dark' ? themeAbyss : themeLight
api.addEdgeGroup('left',  { id:'left-edge', initialSize, minimumSize, maximumSize })
api.addEdgeGroup('right', { id:'right-edge', ... }); api.setEdgeGroupVisible('right', rightDefault)
// bottom 可选；panel.group.locked = 'no-drop-target' 防导航/右栏被拖走
// tab 高度 CSS: --dv-tabs-and-actions-container-height: 28px
```

## 关联
- 相关实体: [[entities/product-react]]
- 参见: [[topics/topic-project-architecture]], [[topics/topic-design-system]]

## 引用来源
- [1] [[raw/lib-dockview-v66]] — 官方 edgeGroups/theming 文档 + 项目调研
- [2] https://dockview.dev/docs/core/groups/edgeGroups/

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/lib-dockview-v66]]
