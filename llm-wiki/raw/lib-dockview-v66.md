# 原始素材：Dockview 6.6（dockview-react）

> 来源：
> - https://dockview.dev/docs/core/groups/edgeGroups/ （联网抓取 2026-07-08）✅
> - https://dockview.dev/docs/core/theming/ （联网抓取 2026-07-08）✅
> - 项目既有调研：docs/dockview-research.md ✅
> 可信度：✅ 已核验

## 安装
- `npm install dockview-react`
- CSS：`import 'dockview-react/dist/styles/dockview.css'`

## 核心概念
| 概念 | 说明 |
|------|------|
| Panel | 内容单元，按 `id`+`component` 注册，通过 `api.addPanel()` 创建 |
| Group | Panel 容器，带 tab 栏 |
| Edge Group | 钉在四边（left/right/top/bottom），可折叠，是结构性元素，不能浮动/弹出 |

## Edge Group API（关键）
```ts
api.addEdgeGroup('left', { id: 'left-group', initialSize: 220, minimumSize: 150, maximumSize: 600 })
api.setEdgeGroupVisible('left', true)
api.isEdgeGroupVisible('left')
api.getEdgeGroup('left')
api.removeEdgeGroup('left') // 移除并 dispose 所有 panel
const g = api.getEdgeGroup('left')
g?.collapse(); g?.expand(); g?.isCollapsed()
```
- 每边只能有一个 edge group，`addEdgeGroup` 重复注册抛错
- 点击 active tab 切换折叠/展开；移除所有 panel 自动折叠
- `collapsedSize` 默认 35px（themeAbyss/themeAbyssSpaced 为 44）
- 状态自动包含在 `toJSON`/`fromJSON`

## 向 Edge Group 加 Panel
```ts
const leftApi = api.addEdgeGroup('left', { id: 'left-group', initialSize: 220 })
api.addPanel({ id: 'explorer', component: 'Explorer', title: 'Explorer',
  position: { referenceGroup: leftApi.id } })
```
- 锁定：`panel.group.locked = true` 或 `'no-drop-target'`
- 激活已存在 panel：`panel.api.setActive()`（注意 v6.6 无 `setActivePanel` 方法）

## 主题
- 内置主题：dark / light / visualStudio / abyss / dracula / nord / catppuccinMocha / monokai / solarizedLight / githubDark / githubLight 等
- React 用法：`theme={themeAbyss}`，或 `const { className } = themeAbyss` 给其他组件
- 自定义主题对象：`DockviewTheme { name, className, colorScheme?, ... }`
- 关键 CSS 变量：`--dv-tabs-and-actions-container-height`、`--dv-background-color`、`--dv-paneview-active-outline-color`、`--dv-active-sash-color`
- 扩展主题：`.dockview-theme-abyss { .dv-groupview.dv-active-group > .dv-tabs-and-actions-container { border-bottom: ... } }`

## 序列化
```ts
const state = api.toJSON()
api.fromJSON(state) // 自动按 state 重建 edge groups
```

## 本项目现状（layout-dock）
- `packages/layout-dock/src/DockLayout.tsx`：
  - `import { DockviewReact, themeAbyss, themeLight }`
  - 暗色 `theme === 'dark' ? themeAbyss : themeLight`
  - `addEdgeGroup('left', { id:'left-edge', initialSize, minimumSize, maximumSize })`
  - `addEdgeGroup('right', {...})` + `setEdgeGroupVisible('right', rightDefault)`
  - bottom 可选；`panel.group.locked = 'no-drop-target'` 防止导航/右栏被拖走
  - tab 高度通过 CSS `--dv-tabs-and-actions-container-height: 28px` 缩减（AGENTS.md）
