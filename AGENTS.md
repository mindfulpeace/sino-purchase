# 项目记忆

## 技术栈
- React 19 + Vite 8 + TypeScript 6
- MUI 9 (`@mui/material`, `@mui/icons-material`) — UI 组件库
- Emotion (`@emotion/react`, `@emotion/styled`) — MUI 依赖
- Monaco Editor (`@monaco-editor/react`)
- CSV 解析: `papaparse`
- Google Sheets API v4 (OAuth via GSI, 无官方 SDK, 直接 fetch)
- 状态管理: Zustand (`app/stores/`)
- 布局: dockview (`@sino-purchase/layout-dock`)

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动主应用 dev server (端口 5173, 自动 fallback) |
| `npm run build` | 构建全部子包 → 主应用 (含 tsc 类型检查) |
| `npm run test` | 运行 vitest 全部测试 |
| `npm run lint` | ESLint 检查 |
| `npm run typecheck` | `tsc -b` 全项目类型检查 |
| `npm run dev:desk` | 启动 desk-ui demo 应用 |
| `npm run build:utils` | 单独构建 `@sino-purchase/utils` (deepClone) |
| `npm run build:diff` | 单独构建 `@sino-purchase/diff` (calculateDiff/diffSql) |
| `npm run build:doc-utils` | 单独构建 `@sino-purchase/doc-utils` (amountToWord) |
| `npm run build:doc` | 单独构建 `@sino-purchase/doc-reimburse` (费用报销单) |
| `npm run build:print` | 单独构建 `@sino-purchase/print` |
| `npm run build:sheets-core` | 单独构建 `@sino-purchase/sheets-core` (auth/db/queue, 无 React) |
| `npm run build:sheets-react` | 单独构建 `@sino-purchase/sheets-react` (React 绑定) |
| `npm run build:dock` | 单独构建 `@sino-purchase/layout-dock` |

## 布局命名 (沟通名称 / 组件名 / CSS 类名)

| 名称 | 组件 | CSS 类 | 说明 |
|---|---|---|---|
| 标题栏 | `TitleBar` | `.hdr` | 顶部标题 |
| 导航栏 | `ActivityBar` | `.nav` | 左侧图标列 |
| 菜单栏 | `SiderBar` | `.menu` | 导航栏右侧面板 |
| 编辑区 | `EditorArea` | `.editor` | 中央 tab + 编辑器 |
| 属性栏 | `PropertiesBar` | `.right` | 右侧边栏 |
| 底部面板 | `Panel` | `.panel` | 底部终端区 |
| 状态栏 | `StatusBar` | `.status` | 底部状态条 |

## 架构 (Monorepo)

```
sino-purchase-v2/
├── package.json               # npm workspaces root (private)
├── packages/
│   ├── desk-ui/               # @sino-purchase/desk-ui (遗留布局库, DEPRECATED, 已由 layout-dock 替代)
│   │   └── src/               # layout/ theme/ hooks/
│   ├── ui-dock/               # @sino-purchase/ui-dock (dockview 布局库 v1, DEPRECATED, 已由 layout-dock 替代)
│   │   └── src/               # DockLayout/StatusBar/HeaderToggles (分叉前版本)
│   ├── utils/                 # @sino-purchase/utils (通用工具, 零依赖, 仅 deepClone)
│   │   └── src/               # clone
│   ├── diff/                  # @sino-purchase/diff (数据差异计算, 零依赖)
│   │   └── src/               # calculateDiff/diffSql
│   ├── doc-utils/             # @sino-purchase/doc-utils (财务文档工具, 零依赖)
│   │   └── src/               # amountToWord (中文大写金额)
│   ├── doc-reimburse/         # @sino-purchase/doc-reimburse (费用报销单组件, 依赖 doc-utils)
│   │   └── src/               # DocReimburse.tsx
│   ├── print/                 # @sino-purchase/print (A4 打印组件)
│   │   └── src/               # PrintView.tsx + PrintPaper.tsx
│   ├── sheets-core/           # @sino-purchase/sheets-core (Google Sheets 逻辑层, 无 React)
│   │   └── src/               # auth/db/sync-queue/config/types
│   ├── sheets-react/          # @sino-purchase/sheets-react (React 绑定, 依赖 sheets-core)
│   │   └── src/               # SheetsProvider/useAuth/useSheetData/useSync
│   └── layout-dock/           # @sino-purchase/layout-dock (dockview 编辑器应用框架布局库)
│       └── src/               # DockLayout/useDock/components + styles/
├── apps/
│   ├── demo-ui/               # UI 库演示 (Component/Icon/Monaco/Csv showcase)
│   └── sino-purchase-v2/      # 主应用
│       └── src/
│           ├── App.tsx        # DockLayout + SheetsProvider, 6 导航(含登录) + lazy 页面
│           ├── app/stores/    # Zustand stores: plan/accounting/material/payment/docSettings
│           ├── modules/       # 业务模块 (plan/ accounting/ material/)
│           │   ├── plan/      # 采购清单: types/TaskList/TaskDetail/FilterModals + plan.css
│           │   └── accounting/ # 现金日记账: types/CashGrid/ImportDialog/Toolbar/hooks
│           ├── pages/         # 页面入口 (薄包装, 组合 modules + stores)
│           ├── config/        # sheets.ts (CLIENT_ID/SPREADSHEET_ID), demo-data.ts
│           └── components/    # 通用组件
└── scripts/                   # 部署脚本
```

## 设计决策
- **Provider 嵌套**: `ThemeProvider > SheetsProvider > DockLayout` (`main.tsx`)，MUI ThemeProvider 使用 `createTheme` 定义暗色主题
- **根元素类名**: `app-root` 用于 CSS 选择器限定
- **颜色变量**: 所有颜色定义在 `:root` (暗色) / `:root.theme-light` (亮色) → MUI 组件通过 `createTheme` + `sx` prop 访问
- **暗色模式**: MUI ThemeProvider 定义 `palette.mode: 'dark'`；现有 ThemeContext 切换 `theme-light` class；MUI 组件继承 palette 颜色
- **亮色模式**: `html` 加 `.theme-light` 类 (ThemeContext useEffect)
- **状态管理**: Zustand stores 在 `app/stores/` 下按业务拆分 (plan/accounting/material/payment/docSettings)。planStore 中 `applyFilter()` 在每次 setter 内合并调用，避免两次 `set`
- **页面架构**: `pages/` 为薄入口，组合 `app/stores/` + `modules/`。`modules/` 下按业务拆分组件和 hooks
- **按钮焦点**: `button:focus { outline: none !important }` 移除蓝色外框
- **拖拽缩放**: `useSidebarResize` 左栏 (手柄在右侧, `+clientX`); `useRightResize` 右栏 (手柄在左侧, `-clientX`)
- **CSS 覆盖文件**: MUI 组件颜色覆盖集中在 `main.tsx` 的 `createTheme` + `index.css` 中，额外覆盖在 `index.css` 末尾
- **懒加载**: 5 个页面均用 `React.lazy` 分包，首屏不加载 Monaco (~600KB) 和 xlsx (~416KB)
- **菜单栏默认**: 300px 宽，最小 120px，最大 600px；文件树 `text-overflow: ellipsis` 防换行
- **标题栏高**: 26px
- **Vite base path**: `/` (根路径，适配 Cloudflare Pages 部署)
- **layout-dock 主题**: 使用 `themeAbyss` (深蓝/紫) 作为暗色主题，`themeLight` 作为亮色主题。主题切换通过 `theme`/`setTheme` context 状态实现，`DockviewReact` 接收不同 theme 对象
- **layout-dock tab 高度**: `--dv-tabs-and-actions-container-height: 28px` (两个主题均设)，从默认 35px 缩减
- **layout-dock 定位**: 基于 dockview 的「编辑器应用框架」布局库（非纯布局引擎），内置 navigation/editors/rightPanels/bottom 业务语义 + persistenceKey 持久化。注意：`title`/`headerRight`/`statusBar`/`HeaderToggles` 属于已废弃的 ui-dock，layout-dock 当前不含这些；后续计划将 ui-dock 独有功能合并回 layout-dock
- **layout-dock 面板文字**: `.dv-content-container` 使用 `opacity: 0.7` (暗色) / `0.85` (亮色)，标题 `opacity: 1.0`
- **layout-dock 焦点轮廓**: `--dv-paneview-active-outline-color: transparent` 禁用面板聚焦蓝色轮廓
- **layout-dock 编辑器 tab 按钮**: `.dv-tab .dv-default-tab-action { display: none }` 隐藏 float/maximize/minimize 按钮
- **layout-dock 面板包装类**: 每个面板内容由 `<div className="layout-dock-{left|center|right|bottom}">` 包裹，用于 `@media print` 定位打印区域
- **layout-dock 打印**: `@media print` 隐藏 chrome (tabs/headers/resize-handles) + `.layout-dock-left/center/bottom`，重置 dockview 内部布局为静态流，仅保留 `.layout-dock-right` 中的 printable 内容填满页面

## 已修复的问题
1. `bp5-` → `bp6-` 前缀（已废弃：现已迁移至 MUI v9）
2. 对话框/抽屉背景透明的 Portal 作用域问题（已废弃：MUI Dialog 自带 Portal 支持）
3. Slider 标尺密度 (`labelStepSize=10`)
4. `<pre>` 不能放在 `<p>` 内
5. 导航栏 active 指示器 `top/bottom` 改为 `1px`
6. `useHotkeys()` 需要 `<HotkeysProvider>` 包裹
7. 图标名称需使用 `IconNames` 常量 (不是大写字符串)
8. `replaceAll` 误伤 `.app-body` → `-body` (删 `.app` 时 class 名被截断)
9. `App.css` → `index.css` 合并，去重 `#root` 宽高样式
10. `ref` 赋值不能在 render 阶段做 → 移到 `useEffect`
11. `useMemo` 依赖数组缺 `searchParams`/`validIds` → 改用 `useState`/`useReducer` lazy init
12. Dialog/Drawer 打开后布局崩溃: `AppLayout.css` 的 `.bp6-dark` 选择器无作用域限制，portal div 误获 `height:100vh;background:var(--bg-surface)` → 根 div 加 `app-root` 类名，CSS 改为 `.app-root.bp6-dark`
13. 打印字体缩小 + 分页失效：根因是 `.print-view` 用了 `position: fixed`，导致 `page-break-*` 被忽略（CSS 规范：分页只对根元素正常流中的块级元素生效），且 `#root { height: 100vh }` 和 `.editor { flex: 1 }` 在打印时未覆盖，限制了打印内容宽度。修复：`@media print` 中移除 `position: fixed`，改用正常流；`body/ #root/ .app-root/ .app-body/ .right/ .right-content` 全部 `display: block; height: auto; overflow: visible`；`.editor` 加入 `display: none`；打印字体改为 `14px`
14. `IconNames.SIDEBAR_LEFT`/`SIDEBAR_RIGHT` 不存在 — TS2339 错误，改用 `ADD_COLUMN_LEFT`/`REMOVE_COLUMN_LEFT` 和 `ADD_COLUMN_RIGHT`/`REMOVE_COLUMN_RIGHT`

## 备忘录
- 所有图标用 `<Icon icon={IconNames.XXX} />` (从 `./components/ui` 导入，底层使用 `@mui/icons-material`)
- `components/ui/` 提供镜像 BP 兼容 API 的 MUI 组件（Button, Dialog, Popover, Menu, 表单控件等），业务代码无需改动 import 路径
- 属性栏 (`PropertiesBar`) 通过 `AppLayout` 的 `propertiesPanel` prop 传入，可选中不传则不显示
- 菜单栏内容 (`menu-content div, span`) 全局设为 `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- 主应用 (`apps/sino-purchase-v2`) 引用 `@sino-purchase/layout-dock` + `@sino-purchase/sheets-react` + `@sino-purchase/doc-reimburse` + `@sino-purchase/print`
- Demo apps: `demo-ui` 引用 `@sino-purchase/ui-dock` (deprecated) + `@sino-purchase/desk-ui` (deprecated); `layout-dock-demo` 引用 `@sino-purchase/layout-dock`; `sheets-api-demo` 引用 `@sino-purchase/sheets-react`
- `npm run dev` 启动主应用 dev server
- `npm run dev:desk` 启动 desk-ui demo 应用
- `npm run test` 运行 vitest 全部测试 (utils + desk-ui + main)
- `npm run typecheck` 运行 tsc -b 全项目类型检查
- `.github/workflows/ci.yml`: lint → typecheck → test → build
- `vitest.config.ts` 通过 `test.projects` 指向 `packages/desk-ui` + `packages/utils` + `packages/diff` + `packages/doc-utils` + `apps/sino-purchase-v2`
- **sheets-core/sheets-react 拆分**: 原 `sheets-api` 上帝包已拆为两层 — `sheets-core` (纯逻辑层: auth/db/sync-queue/config/types, 无 React, 浏览器环境) + `sheets-react` (React 绑定: SheetsProvider/useAuth/useSheetData/useSync, 依赖 sheets-core)。`sheets-react` 通过 `export *` re-export sheets-core 全部 API，消费者只需依赖 `@sino-purchase/sheets-react`
- Google Sheets API 数据流: `useSheetData<T>` (sheets-react) → `db.ts` (sheets-core) → `auth.ts` (sheets-core, requestToken) → Google Sheets REST API v4
- Sheets 离线队列: `sync-queue.ts` (sheets-core, localStorage) + `SyncProvider` (sheets-react) → `processQueue()` (sheets-core)
- Sheets 认证: GSI OAuth 2.0, token 存 localStorage, 5 分钟前静默刷新。`useAuth()` 返回 `{ ready, loggedIn, user, login, logout }`，登录后调用 Google userinfo API 获取并缓存；退出时清除 token + revoke + 清除 userInfo 缓存
- `sheets-core` 零 runtime 依赖 (纯 fetch + 浏览器 API); `sheets-react` peer deps 仅 React
- **utils 拆分**: 原 `utils` 杂物间已拆为三个职责单一的包 — `@sino-purchase/utils` (仅 `deepClone`) + `@sino-purchase/diff` (`calculateDiff`/`diffSql`) + `@sino-purchase/doc-utils` (`amountToWord`)。三者均零依赖
- `@sino-purchase/doc-reimburse` (原 `doc`, 已重命名) 提供 `DocReimburse` 费用报销单组件，依赖 `@sino-purchase/doc-utils`，纯 CSS (无 Emotion)，需导入 `style.css`
- `@sino-purchase/print` 提供 `PrintView`(A4 打印容器) + `PrintPaper`(单页包装)，纯 CSS (无 Emotion)，需导入 `style.css`
- **Zustand stores** (`app/stores/`): planStore (筛选/排序/分组 + localStorage 持久化), accountingStore (records CRUD + importDialog), docSettingsStore (打印设置), materialStore, paymentStore
- planStore `applyFilter()` 在 `setFilterSetter` 闭包中合并调用，避免每个 filter 变化触发两次重渲染
- accountingStore 通过 `useEffect` 将 `records` 同步到 `docSettingsStore.reimburseRecords` 供打印使用
- `CashGrid` 使用原生 `<table>` + inline 编辑替换（原 `@blueprintjs/table` 的 `Table2`）
- 导入流程: Excel 或剪贴板 → 解析为 CashRecord[] → ImportDialog 预览 → 确认 → 加入 Zustand store
- `@sino-purchase/layout-dock` 是 dockview 编辑器应用框架布局库，提供 `DockLayout` 组件和 `useDock` hook。导出 `DockMenuItem`、`DockInput`、`DockPlaceholder`、`DockSection` 组件。使用 `themeAbyss`/`themeLight` 主题。peer deps 仅 dockview + react + react-dom（已移除 Blueprint 依赖）
- layout-dock Context API (`useDock()`): `openEditor(id)`, `closeEditor(id)`, `getApi()`, `setLeftVisible(v)`, `setRightVisible(v)`, `setBottomVisible(v)`, `leftVisible`, `rightVisible`, `bottomVisible`, `theme`, `setTheme(t)` (注意: `status`/`summary`/`setStatus`/`setSummary` 属于已废弃的 ui-dock)
- layout-dock Props: `navigation[]`, `editors?` (含 `rightPanels` per-editor), `bottom?`, `left?`, `right?`, `bottomEdge?`, `defaultTheme?`, `rightDefault?`, `bottomDefault?`, `rightVisible?`, `onRightVisibleChange?`, `persistenceKey?`, `onReady?` (注意: `title`/`headerRight`/`properties`/`statusBar` 属于已废弃的 ui-dock)
- layout-dock edge groups: left (导航面板, 300px), right (属性栏, 350px, 默认隐藏), bottom (底部面板, 200px, 默认隐藏)
- dockview 主题切换需要传递不同 theme 对象给 `DockviewReact`，不能仅通过 CSS 类切换
- `--dv-tabs-and-actions-container-height` 必须在每个主题类下单独设置（变量作用域不共享）
- `IconNames.SIDEBAR_LEFT`/`SIDEBAR_RIGHT` 不存在 — 使用 `ADD_COLUMN_LEFT`/`REMOVE_COLUMN_LEFT` 和 `ADD_COLUMN_RIGHT`/`REMOVE_COLUMN_RIGHT`
- `@sino-purchase/desk-ui` + `@sino-purchase/ui-dock` 均已标记 DEPRECATED (private:true)，新代码使用 `@sino-purchase/layout-dock`。ui-dock 与 layout-dock 为同一库的两个分叉（ui-dock 有 title/headerRight/statusBar/HeaderToggles，layout-dock 有 persistence/per-editor rightPanels），后续计划合并
- Vite base 为 `/`，构建产物直接部署到 Cloudflare Pages
- 左侧导航第 6 项为登录标签 (`LoginNavPanel`): 未登录时显示"登录 Google"按钮，已登录时显示 Google 用户名/邮箱 + "退出登录"按钮
- Git remote: `https://mindfulpeace@github.com/mindfulpeace/sino-purchase.git`
