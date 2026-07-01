# 项目记忆

## 技术栈
- React 19 + Vite 8 + TypeScript 6
- Blueprint 6 (`@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/table`)
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
| `npm run build:utils` | 单独构建 `@sino-purchase/utils` |
| `npm run build:doc` | 单独构建 `@sino-purchase/doc` |
| `npm run build:print` | 单独构建 `@sino-purchase/print` |
| `npm run build:sheets` | 单独构建 `@sino-purchase/sheets-api` |
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
│   ├── desk-ui/               # @sino-purchase/desk-ui (布局库, 遗留, 新代码使用 layout-dock)
│   │   └── src/               # layout/ theme/ hooks/
│   ├── utils/                 # @sino-purchase/utils (工具函数, 零依赖)
│   │   └── src/               # clone/diff/diffSql/format
│   ├── doc/                   # @sino-purchase/doc (费用报销单组件)
│   │   └── src/               # DocReimburse.tsx
│   ├── print/                 # @sino-purchase/print (A4 打印组件)
│   │   └── src/               # PrintView.tsx + PrintPaper.tsx
│   ├── sheets-api/            # @sino-purchase/sheets-api (Google Sheets 数据层)
│   │   └── src/               # auth/db/sync-queue/useAuth/useSheetData/useSync
│   └── layout-dock/           # @sino-purchase/layout-dock (dockview 布局库)
│       └── src/               # DockLayout/StatusBar/HeaderToggles + styles/
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
- **Provider 嵌套**: `SheetsProvider > DockLayout` (App.tsx); Portal 组件需 `PortalProvider > OverlaysProvider > HotkeysProvider` (BP6 推荐顺序)
- **根元素类名**: 根 div 用 `app-root bp6-dark` 或 `app-root bp6-light`，`app-root` 用于 CSS 选择器限定（防止 portal div 的 `bp6-dark` 误匹配布局样式）
- **颜色变量**: 所有颜色定义在 `:root` (暗色) / `:root.bp6-theme-light` (亮色) → Portal 组件 (Dialog/Drawer) 可通过 `var()` 访问
- **暗色模式**: 根 div 加 `bp6-dark` 类 → BP6 内置暗色样式; PortalProvider 为 Portal 容器加 `bp6-dark`
- **亮色模式**: `html` 加 `.bp6-theme-light` 类 (ThemeContext useEffect); PortalProvider 不加 `bp6-dark`, BP6 默认亮色样式
- **Dialog/Drawer**: 用 `.bp6-dark .bp6-dialog` 全局选择器覆盖 (Portal 作用域问题)
- **状态管理**: Zustand stores 在 `app/stores/` 下按业务拆分 (plan/accounting/material/payment/docSettings)。planStore 中 `applyFilter()` 在每次 setter 内合并调用，避免两次 `set`
- **页面架构**: `pages/` 为薄入口，组合 `app/stores/` + `modules/`。`modules/` 下按业务拆分组件和 hooks
- **按钮焦点**: `button:focus { outline: none !important }` 移除蓝色外框
- **拖拽缩放**: `useSidebarResize` 左栏 (手柄在右侧, `+clientX`); `useRightResize` 右栏 (手柄在左侧, `-clientX`)
- **CSS 覆盖文件**: 所有 BP6 组件颜色覆盖集中在 `blueprintOverrides.css`，无作用域前缀，因 SPA 自然隔离
- **懒加载**: 5 个页面均用 `React.lazy` 分包，首屏不加载 Monaco (~600KB) 和 xlsx (~416KB)
- **菜单栏默认**: 300px 宽，最小 120px，最大 600px；文件树 `text-overflow: ellipsis` 防换行
- **标题栏高**: 26px
- **Vite base path**: `/` (根路径，适配 Cloudflare Pages 部署)
- **layout-dock 主题**: 使用 `themeAbyss` (深蓝/紫) 作为暗色主题，`themeLight` 作为亮色主题。主题切换通过 `theme`/`setTheme` context 状态实现，`DockviewReact` 接收不同 theme 对象
- **layout-dock tab 高度**: `--dv-tabs-and-actions-container-height: 24px` (两个主题均设)，从默认 35px 缩减
- **layout-dock 标题栏**: `dv-titlebar-right` 区域用于消费者自定义按钮 (`headerRight` prop)；内置 `<HeaderToggles />` (Blueprint Icon, 左/下/右 edge 切换)
- **layout-dock 状态栏**: 内置 22px 状态栏，通过 `useDock()` context 的 `status`(左) + `summary`(右) 让消费者自由设置
- **layout-dock 面板文字**: `.dv-content-container` 使用 `opacity: 0.7` (暗色) / `0.85` (亮色)，标题 `opacity: 1.0`
- **layout-dock 焦点轮廓**: `--dv-paneview-active-outline-color: transparent` 禁用面板聚焦蓝色轮廓
- **layout-dock 编辑器 tab 按钮**: `.dv-tab .dv-default-tab-action { display: none }` 隐藏 float/maximize/minimize 按钮
- **layout-dock 面板包装类**: 每个面板内容由 `<div className="layout-dock-{left|center|right|bottom}">` 包裹，用于 `@media print` 定位打印区域
- **layout-dock 打印**: `@media print` 隐藏 chrome (tabs/headers/resize-handles) + `.layout-dock-left/center/bottom`，重置 dockview 内部布局为静态流，仅保留 `.layout-dock-right` 中的 printable 内容填满页面

## 已修复的问题
1. `bp5-` → `bp6-` 前缀
2. 对话框/抽屉背景透明的 Portal 作用域问题
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
- 所有 Blueprint 图标用 `<Icon icon={IconNames.XXX} />` (从 `@blueprintjs/icons` 导入)
- `MultiSlider.Handle` 使用 `onChange` 属性 (不是 `onChangeBefore`)
- `CompoundTag` 右侧内容用 `children` (不是 `rightContent`)
- `OverlayToaster.create()` 返回 `Promise<Toaster>`, 需要用 `useRef` + `useEffect` 获取
- `Breadcrumbs` 从 `@blueprintjs/core/lib/esm/components/breadcrumbs/breadcrumbs` 导入 (BP6.15 顶部 re-export 缺失)
- `Tab` 用 `panel` 属性代替 `TabPanel` 组件
- IconShowcase 自动分组: 按 `IconNames` 枚举名前缀归为 Actions/Arrows/Files/UI/Editor/Graph 等
- 属性栏 (`PropertiesBar`) 通过 `AppLayout` 的 `propertiesPanel` prop 传入，可选中不传则不显示
- 菜单栏内容 (`menu-content div, span`) 全局设为 `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- 主应用 (`apps/sino-purchase-v2`) 引用 `@sino-purchase/layout-dock` + `@sino-purchase/sheets-api` + `@sino-purchase/utils/doc/print`
- Demo app (`apps/demo-ui`) 通过 npm workspace 引用：`"@sino-purchase/layout-dock": "*"`
- `npm run dev` 启动主应用 dev server
- `npm run dev:desk` 启动 desk-ui demo 应用
- `npm run test` 运行 vitest 全部测试 (utils + desk-ui + main)
- `npm run typecheck` 运行 tsc -b 全项目类型检查
- `.github/workflows/ci.yml`: lint → typecheck → test → build
- `vitest.config.ts` 通过 `test.projects` 指向 `packages/desk-ui` + `packages/utils` + `apps/sino-purchase-v2`
- Google Sheets API 数据流: `useSheetData<T>` → `db.ts` (loadTable/insertRow/updateRow/deleteRow) → `auth.ts` (requestToken) → Google Sheets REST API v4
- Sheets 离线队列: `sync-queue.ts` (localStorage) + `SyncProvider` → `processQueue()`
- Sheets 认证: GSI OAuth 2.0 (https://accounts.google.com/gsi/client), token 存 localStorage, 5 分钟前静默刷新。`useAuth()` 返回 `{ ready, loggedIn, user, login, logout }`，`user` 为 `GoogleUserInfo` (name/email/picture)，登录后调用 Google userinfo API 获取并缓存到 localStorage；退出时清除 token + revoke Google token + 清除 userInfo 缓存
- `sheets-api` 无 runtime 依赖, 纯 fetch, peer deps 仅 React
- `@sino-purchase/utils` 零依赖，提供 `amountToWord`(中文大写金额)/`deepClone`/`calculateDiff`/`diffSql`
- `@sino-purchase/doc` 提供 `DocReimburse` 费用报销单组件，纯 CSS (无 Emotion)，需导入 `style.css`
- `@sino-purchase/print` 提供 `PrintView`(A4 打印容器) + `PrintPaper`(单页包装)，纯 CSS (无 Emotion)，需导入 `style.css`
- **Zustand stores** (`app/stores/`): planStore (筛选/排序/分组 + localStorage 持久化), accountingStore (records CRUD + importDialog), docSettingsStore (打印设置), materialStore, paymentStore
- planStore `applyFilter()` 在 `setFilterSetter` 闭包中合并调用，避免每个 filter 变化触发两次重渲染
- accountingStore 通过 `useEffect` 将 `records` 同步到 `docSettingsStore.reimburseRecords` 供打印使用
- `CashGrid` 使用 `@blueprintjs/table` 的 `Table2` + `Column`，按税务字段 HSL 着色，支持点击排序
- 导入流程: Excel 或剪贴板 → 解析为 CashRecord[] → ImportDialog 预览 → 确认 → 加入 Zustand store
- `@sino-purchase/layout-dock` 是 dockview 布局库，提供 `DockLayout` 组件和 `useDock` hook。导出 `StatusBar`、`DockMenuItem`、`DockInput`、`DockPlaceholder`、`DockSection` 组件。使用 `themeAbyss`/`themeLight` 主题。peer deps 含 Blueprint
- layout-dock Context API (`useDock()`): `openEditor(id)`, `closeEditor(id)`, `getApi()`, `setLeftVisible(v)`, `setRightVisible(v)`, `setBottomVisible(v)`, `leftVisible`, `rightVisible`, `bottomVisible`, `status`, `summary`, `setStatus(msg)`, `setSummary(msg)`, `theme`, `setTheme(t)`
- layout-dock Props: `title?`, `headerRight?` (ReactNode), `navigation[]`, `editors?`, `properties?`, `bottom?`, `left?`, `right?`, `bottomEdge?` (EdgeGroupConfig), `defaultTheme?`, `rightDefault?`, `bottomDefault?`, `statusBar?`, `onReady?`
- layout-dock edge groups: left (导航面板, 300px), right (属性栏, 350px, 默认隐藏), bottom (底部面板, 200px, 默认隐藏)
- dockview 主题切换需要传递不同 theme 对象给 `DockviewReact`，不能仅通过 CSS 类切换
- `--dv-tabs-and-actions-container-height` 必须在每个主题类下单独设置（变量作用域不共享）
- `IconNames.SIDEBAR_LEFT`/`SIDEBAR_RIGHT` 不存在 — 使用 `ADD_COLUMN_LEFT`/`REMOVE_COLUMN_LEFT` 和 `ADD_COLUMN_RIGHT`/`REMOVE_COLUMN_RIGHT`
- `@sino-purchase/desk-ui` 为遗留布局库，新代码优先使用 `@sino-purchase/layout-dock`
- Vite base 为 `/`，构建产物直接部署到 Cloudflare Pages
- 左侧导航第 6 项为登录标签 (`LoginNavPanel`): 未登录时显示"登录 Google"按钮，已登录时显示 Google 用户名/邮箱 + "退出登录"按钮
- Git remote: `https://mindfulpeace@github.com/mindfulpeace/sino-purchase.git`
